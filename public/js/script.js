Vue.component('modal-component', {
    props: ['id'],
    watch: {
        id: function() {
            axios.get("/images/" + this.id).then(function(resp) {
                if (!resp.data.success) {
                    this.$emit("close");
                } else {
                    this.image = resp.data.image;
                    axios.get("/comments/" + this.id).then(function(resp) {
                        this.comments = resp.data.comments;
                    }.bind(this))
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            }.bind(this));
        }
    },
    data: function(){
        return {
            image: {
                title: '',
                description: '',
                username: '',
                url: '',
                created_at: '',
                id: null
            },
            comment: '',
            comments: [],
            commentFormInfo: {}
        };
    },
    mounted: function() {
        axios.get('/images/' + this.id).then( function(result){
            this.image = result.data;
            axios.get("/comments/" + this.id).then( function(result) {
                this.comments = result.data;
            }.bind(this));
        }.bind(this)).catch(function(err) {
            console.log(err);
        });
    },
    methods: {
        closeModal: function() {
            console.log('close modal');
            console.log(this.id);
            this.$emit('close', this.id);
        },
        addComment: function() {
            console.log('ADDING COMMENT');
            axios.post('/images/comment', {
                comment: this.commentFormInfo.comment,
                username: this.commentFormInfo.username,
                image_id: this.id
            }).then(function (result) {
                this.comments.push(result.data);
            }.bind(this));
        }
    },
    template: '#modal-template'
});

new Vue ({
    el: '#main',
    data: {
        imgFormInfo: {
            title: '',
            description: '',
            username: '',
            img: null
        },
        imgFile: '',
        images: [],
        currentImageId: location.hash.slice(1),
        image: {
            title: '',
            description: '',
            username: ''
        },
        comment: {
            comments: '',
        }
    },
    mounted: function() {
        axios.get('/images').then(function(resp){
            this.images = resp.data.images;
        }.bind(this));
    },
    methods: {
        theFunction: function(e) {
            console.log(e);
        },
        selectFile: function(e) {
            console.log(`running selectFile`);
            this.imgFormInfo.img = e.target.files[0];
            console.log(this.imgFormInfo.img);
        },
        uploadImage: function(e) {
            e.preventDefault();
            const fd = new FormData();
            fd.append('title', this.imgFormInfo.title);
            fd.append('description', this.imgFormInfo.description);
            fd.append('username', this.imgFormInfo.username);
            fd.append('file', this.imgFormInfo.img);
            axios.post('/upload', fd).then(result => {
                this.images.unshift(result.data.image);
            }).then(function(result) {
                console.log(result);
            });
        },
        openModal: function(imageId) {
            this.currentImageId = imageId;
            document.body.style.overflow="hidden";
        },
        closeModal: function() {
            this.currentImageId = false;
            document.body.style.overflow="auto";
        },
        addComment: function() {
            console.log('ADDING COMMENT');
        },
        moreImages: function() {
            let last = this.images[this.images.length - 1];
            axios.get("/images/more/" + last.id).then(function(results) {
                this.images = [...this.images, ...results.data];
            }.bind(this));
        }
    },
});
