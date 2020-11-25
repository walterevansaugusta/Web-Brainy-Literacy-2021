export class ChimeraAnimal {
    id: string; 
    zooid: string;  
    head: string;  
    body: string;  
    tail: string;
    tailtype: string;
    completed: boolean;  

    constructor(id: string, zooid: string, head: string, body: string, tail: string, tailtype: string, completed: boolean) {
        this.id = id;
        this.zooid = zooid;
        this.head = head;
        this.body = body;
        this.tail = tail;
        this.tailtype = tailtype;
        this.completed = completed;
    }
}
