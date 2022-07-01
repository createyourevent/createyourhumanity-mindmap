import Topic from "../../Topic";

export default class LinkModel {

    private _topic: Topic;

    constructor(topic: Topic) {
        this._topic = topic;
    }

    public getPath(): number[] {
        const topics: number [] = [];
        const self = this._topic;
        topics.push(self.getId());
        let parent = this._topic.getParent();
        while(parent) {
            topics.push(parent.getId());
            parent = parent.getParent();
        }
        return topics;
    }
}