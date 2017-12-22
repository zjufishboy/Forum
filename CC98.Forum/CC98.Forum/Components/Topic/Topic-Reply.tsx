﻿import * as React from 'react';
import * as Utility from '../../Utility';
import * as $ from 'jquery';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import { RouteComponent } from '../RouteComponent';
import { Replier } from './Topic-Replier';
import { ReplyContent } from './Topic-ReplyContent';
import { Award } from './Topic-Award';
import { PostManagement } from './Topic-PostManagement';
import { Judge } from './Topic-Judge';
import { ReplierSignature } from './Topic-ReplierSignature';
declare let moment: any;

export class Reply extends React.Component<{topicId, page, topicInfo, boardInfo,  quote, isTrace, isHot, userId }, { inWaiting, contents, masters }>{
    constructor(props, content) {
        super(props, content);
        this.update = this.update.bind(this);
        this.quote = this.quote.bind(this);
        this.state = {
            inWaiting: true,
            contents: [],
            masters: [],
        };
    }
    quote(content, userName, replyTime, floor) {
        this.props.quote(content, userName, replyTime, floor);
    }
    async update() {
        const page = this.props.page || 1;
        let realContents;
        if (this.props.isHot) {
            realContents = await Utility.getHotReplyContent(this.props.topicId);

        } else if (this.props.isTrace) {
            const data = await Utility.getUserInfo(this.props.userId);
            const userName = data.name;
            realContents = await Utility.getCurUserTopicContent(this.props.topicId, page, userName, this.props.userId);
        } else {
            realContents = await Utility.getTopicContent(this.props.topicId, page, this.props.topicInfo.replyCount);
            console.log("after operation");
            console.log(realContents);
        }

        this.setState({ contents: realContents });
    }
    /*async componentDidMount() {
        console.log("did mount reply");
        this.setState({inWaiting:true});
        const page = this.props.page || 1;
        let realContents;
        if (this.props.isHot) {
            realContents = await Utility.getHotReplyContent(this.props.topicId);
            if (!realContents) this.setState({ inWaiting: false, contents: [] });
        } else if (this.props.isTrace) {
            const data = await Utility.getUserInfo(this.props.userId);
            const userName = data.name;
            realContents = await Utility.getCurUserTopicContent(this.props.topicId, page, userName, this.props.userId);
        } else {
            realContents = await Utility.getTopicContent(this.props.topicId, page, this.props.topicInfo.replyCount);
        }
        const masters = this.props.boardInfo.boardMasters;
        this.setState({ inWaiting:false,contents: realContents,masters:masters });
    }*/
    async componentWillReceiveProps(newProps) {
        this.setState({ inWaiting: true });
        const page = newProps.page || 1;
        let realContents;
        if (newProps.isHot) {
            realContents = await Utility.getHotReplyContent(newProps.topicId);
            if (!realContents) this.setState({ inWaiting: false, contents: [] });
        } else if (newProps.isTrace) {
            const data = await Utility.getUserInfo(newProps.userId);
            const userName = data.name;
            realContents = await Utility.getCurUserTopicContent(newProps.topicId, page, userName, newProps.userId);
        } else {
            realContents = await Utility.getTopicContent(newProps.topicId, page, newProps.topicInfo.replyCount);
        }
        const masters = newProps.boardInfo.boardMasters;
        this.setState({inWaiting:false,contents: realContents,masters:masters });

    }

    private generateContents(item) {
        let privilege = null;
        if (Utility.getLocalStorage("userInfo"))
            privilege = Utility.getLocalStorage("userInfo").privilege;
        const id = item.floor % 10;
        let likeInfo = { likeCount: item.likeCount, dislikeCount: item.dislikeCount, likeState: item.likeState };
        return <div className="reply" id={id.toString()} >
            <Replier key={item.postId} userInfo={item.userInfo} isAnonymous={item.isAnonymous} topicid={item.topicId} floor={item.floor} isDeleted={item.isDeleted} traceMode={this.props.isTrace ? true : false} isHot={this.props.isHot ? true : false} />
            <div className="column" style={{ justifyContent: "space-between", width: "80%", position:"relative" }}>
                <Judge userId={item.userId} postId={item.postId} update={this.update} topicId={item.topicId} />
                <PostManagement topicId={item.topicId} postId={item.postId} userId={item.userId} update={this.update} privilege={privilege} boardId={this.props.boardInfo.id} />
                        <ReplyContent key={item.content} postid={item.postId} content={item.content} contentType={item.contentType} />
                        <Award postId={item.postId} updateTime={Date.now()} awardInfo={item.awards} />
                <ReplierSignature floor={item.floor} userInfo={item.userInfo} replyTime={item.time} content={item.content} quote={this.quote} signature={item.userInfo.signatureCode} topicid={item.topicId} userId={item.userId} masters={this.state.masters} postid={item.postId} likeInfo={likeInfo} lastUpdateAuthor={item.lastUpdateAuthor} lastUpdateTime={item.lastUpdateTime} boardId={this.props.boardInfo.id} isLZ={item.isLZ} traceMode={this.props.isTrace ? true : false}/>
            </div>
            <div className="reply-floor">{item.floor}</div>
                </div>;
    }
    componentDidUpdate() {

        if (window.location.hash && window.location.hash !== '#') {
            const hash = window.location.hash;
            const eleId = hash.split("#");
            const Id = eleId[1];
            if (document.getElementById(Id))
            document.getElementById(Id).scrollIntoView();
        }
    }
    render() {
        if (this.props.isHot && this.state.inWaiting)
            return null;
        if (!this.state.inWaiting)
            return <div className="center" style={{ width: "100%" }}>
                {this.state.contents.map(this.generateContents.bind(this))}
            </div>
                ;
        else
            return <i style={{marginTop:"1rem"}} className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>;

    }
}
 
/**
 * 文章内容
 */
export class ContentState {
    constructor(
    ) {

    }
    id: number;
    content: string;
    time: string;
    isDeleted: boolean;
    floor: number;
    isAnonymous: boolean;
    lastUpdateAuthor: string;
    lastUpdateTime: string;
    topicId: number;
    userName: string;
    sendTopicNumber: number;
    userImgUrl: string;
    signature: string;
    userId: number;
    privilege: string;
    likeNumber: number;
    dislikeNumber: number;
    postId: number;
    contentType: number;
    popularity: number;
}