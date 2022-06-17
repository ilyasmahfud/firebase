const entity = 'students';

class Student {
    constructor(id, name, description, number_of_student, img_url, tags, status ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.number_of_student = number_of_student;
        this.img_url = img_url;
        this.tags = tags;
        this.status = status;
    }
}

module.exports = Student;