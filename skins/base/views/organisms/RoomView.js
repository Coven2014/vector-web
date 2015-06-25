/*
Copyright 2015 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var React = require('react');

var MatrixClientPeg = require("../../../../src/MatrixClientPeg");

var ComponentBroker = require('../../../../src/ComponentBroker');
var classNames = require("classnames");

var MessageTile = ComponentBroker.get('molecules/MessageTile');
var RoomHeader = ComponentBroker.get('molecules/RoomHeader');
var MemberList = ComponentBroker.get('organisms/MemberList');
var MessageComposer = ComponentBroker.get('molecules/MessageComposer');

var RoomViewController = require("../../../../src/controllers/organisms/RoomView");

var Loader = require("react-loader");


module.exports = React.createClass({
    displayName: 'RoomView',
    mixins: [RoomViewController],

    getMessageTiles: function() {
        var ret = [];
        var count = 0;
        for (var i = this.state.room.timeline.length-1; i >= 0 && count < this.state.messageCap; --i) {
            var mxEv = this.state.room.timeline[i];
            ret.unshift(
                <li key={mxEv.getId()}><MessageTile mxEvent={mxEv} /></li>
            );
            ++count;
        }
        return ret;
    },

    render: function() {
        var myUserId = MatrixClientPeg.get().credentials.userId;
        if (this.state.room.currentState.members[myUserId].membership == 'invite') {
            if (this.state.joining) {
                return (
                    <div className="mx_RoomView">
                        <Loader />
                    </div>
                );
            } else {
                var inviteEvent = this.state.room.currentState.members[myUserId].events.member.event;
                // XXX: Leaving this intentionally basic for now because invites are about to change totally
                var joinErrorText = this.state.joinError ? "Failed to join room!" : "";
                return (
                    <div className="mx_RoomView">
                        <div className="mx_RoomView_invitePrompt">
                            <div>{inviteEvent.user_id} has invited you to a room</div>
                            <button ref="joinButton" onClick={this.onJoinButtonClicked}>Join</button>
                            <div className="error">{joinErrorText}</div>
                        </div>
                    </div>
                );
            }
        } else {
            var scrollheader_classes = classNames({
                mx_RoomView_scrollheader: true,
                loading: this.state.paginating
            });
            return (
                <div className="mx_RoomView">
                    <RoomHeader room={this.state.room} />
                    <div className="mx_RoomView_HSplit">
                        <ul className="mx_RoomView_MessageList" ref="messageList" onScroll={this.onMessageListScroll}>
                            <li className={scrollheader_classes}>
                            </li>
                            {this.getMessageTiles()}
                        </ul>
                        <MemberList roomId={this.props.roomId} key={this.props.roomId} />
                    </div>
                    <MessageComposer roomId={this.props.roomId} />
                </div>
            );
        }
    },
});
