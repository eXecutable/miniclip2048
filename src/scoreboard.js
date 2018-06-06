export default class scoreboard {

    constructor(){
        this.message = 'Welcome to the game!';
    }

    printMessage() {
        console.log(this.message);
    }
    
    set updateMessage(newMessage) {
        this.message = newMessage;
    }
}