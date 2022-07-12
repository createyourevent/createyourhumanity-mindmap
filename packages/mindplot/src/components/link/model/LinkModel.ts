import ControlModel from "../../model/ControlModel";
import Topic from "../../Topic";

export default class GoToLinkModel {

    private _topic: Topic;

    private _id: string;

    private _modelType: string;

    constructor(topic: Topic) {
        this._topic = topic;
        this._modelType = 'GoToLinkModel';
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

    static createModel(link, attributes): GoToLinkModel {
        return new GoToLinkModel(attributes);
    }


  getId(): string {
    return this._id;
  }


  setId(id: string) {
    this._id = id;
  }

  getModelType() {
    return this._modelType;
  }
}