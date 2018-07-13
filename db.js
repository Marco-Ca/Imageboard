const spicedPg  = require("spiced-pg"),
    db          = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

function getImages() {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 6`);
}

function moreImages(last_id) {
    return db.query(`SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT 6 `,
        [last_id]);
}

function uploadImage(url, username, title, desc) {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4) RETURNING id, url, username, title, description`,
        [url, username, title, desc]
    );
}

function saveImage(title, description, username, url) {
    return db.query(
        `INSERT INTO images (title, description, username, url)
        VALUES ($1, $2, $3, $4) RETURNING id, url, username, title, description`,
        [title || null, description || null, username || null, url]
    );
}

function getImageById(id) {
    return db.query(
        `SELECT * FROM images WHERE id=$1`,
        [id]
    );
}

function addComment(comment, username, image_id) {
    return db.query(`INSERT INTO comments (comment, username, image_id)
    VALUES ($1, $2, $3) RETURNING *`,
    [comment, username, image_id]
    );
}

function getComment(image_id) {
    return db.query(`SELECT * FROM comments WHERE image_id = $1`,
        [image_id]);
}

module.exports = {
    addComment : addComment,
    getImages : getImages,
    getImageById : getImageById,
    uploadImage : uploadImage,
    saveImage : saveImage,
    getComment : getComment,
    moreImages : moreImages
};
