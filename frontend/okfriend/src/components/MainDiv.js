import React, { Component } from 'react'
import EditProfile from './EditProfile'
import MyProfile from './MyProfile'
import UserProfile from './UserProfile'
import HomePage from './HomePage'
import Search from './Search'
import CalendarPage from './CalendarPage'
import NavBar from './NavBar'
import FriendsChatPanel from './FriendsChatPanel'
import { Route, Switch } from 'react-router-dom'

export default class MainDiv extends Component {

    state = {
        allUsers: [],
        // selectedUserID: null,
        username: "",
        zip_code: 0,
        interests: [],
        myFriends: [],
        allChats: [],
        thisChat: {},
        thisChatMessages: [],
        message: ""

    }

    componentDidMount(){
        fetch("http://localhost:3000/users")
        .then(r => r.json())
        .then(resObj => {
            const myUsers = resObj.filter((user) => {
                return user.id !== this.props.userID
            })
            this.setState({
                allUsers: myUsers
            })
        })
        fetch(`http://localhost:3000/users/${this.props.userID}`)
        .then( r=> r.json())
        .then(resObj => {

            this.setState({
                username: resObj.username,
                zip_code: resObj.zip_code,
                interests: resObj.interests,
                myFriends: resObj.all_friendships,
                allChats: resObj.all_chats,
                thisChat: resObj.all_chats[0],
                thisChatMessages: resObj.all_chats[0].messages
            })
        })
    }

    deleteAUser = () => {
        fetch(`http://localhost:3000/users/${this.props.userID}`,{
            method: "DELETE"
        })
        .then( r => r.json())
        .then(resObj => {
            const newUsers = this.state.allUsers.filter((user) => {
                return user.id !== resObj.id
            })
            this.setState({
                allUsers: newUsers
            }, () => this.props.logOutClick())
        })
    }

    addAFriend = (otherUserID) => {
        if (!this.state.myFriends.find(element => element.user1_id === this.props.selectedUserID || element.user2_id === this.state.selectedUserID)){
            fetch('http://localhost:3000/friendships', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    friendship: {
                        user1_id: this.props.userID,
                        user2_id: otherUserID
                    }

                })
            })
                .then(r => r.json())
                .then(resObj => {
                    this.setState({
                        myFriends: [...this.state.myFriends, resObj]
                    })
                })
        } else {
            alert("This person is already your friend!")
        }
    }

    removeAFriend = (otherUserID) => {
        const friendshipID = this.state.myFriends.find(element => element.user1_id === otherUserID || element.user2_id === otherUserID)
        if(friendshipID){
            fetch(`http://localhost:3000/friendships/${friendshipID.id}`, {
                method: "DELETE"
            })
                .then(r => r.json())
                .then(resObj => {
                    const newFriends = this.state.myFriends.filter((friend) => {
                        return friend.id !== resObj.id
                    })
                    this.setState({
                        myFriends: newFriends
                    })
                })
        } else {
            alert("This person is not your friend!")
        }

    }

    startChat = (otherUserID) => {
        // if (this.state.myFriends.find(element => element.user1_id === this.props.selectedUserID || element.user2_id === this.state.selectedUserID)) {
            this.setState({
                // showChatPanel: true,
                selectedUserID: otherUserID
            }, () => console.log("chat started"))
        // } else {
        //     alert("You must be friends to start a chat with someone!")
        // }
    }

    startChatFromLI = (chat) => {
        fetch(`http://localhost:3000/chats/${chat.id}`)
        .then(r => r.json())
        .then(resObj => {
            this.setState({
                // showChatPanel: true,
                // selectedUserID: otherUserID
                thisChatMessages: resObj.messages,
                thisChat: resObj,
                message: ""
            }, () => console.log("chat started"))
        })
        // if (this.state.myFriends.find(element => element.user1_id === this.props.selectedUserID || element.user2_id === this.state.selectedUserID)) {
       
        // } else {
        //     alert("You must be friends to start a chat with someone!")
        // }
    }

    addAChat = (otherUserID) => {
        const myChat = this.state.allChats.find(element => element.user1_id === otherUserID || element.user2_id === otherUserID)
        if (!myChat) {
            fetch("http://localhost:3000/chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    chat: {
                        user1_id: this.props.userID,
                        user2_id: otherUserID
                    }
                })
            })
                .then(r => r.json())
                .then(resObj => {
                    console.log(resObj)
                    this.setState({
                        thisChat: resObj,
                        otherUsername: resObj.user2.username,
                        allChats: [...this.state.allChats, resObj],
                        thisChatMessages: []
                    })
                    alert("adding new chat")
                })
        } else {
            this.setState({
                thisChat: myChat,
                thisChatMessages: myChat.messages,
                otherUsername: myChat.user2.username
        })
    }
}

    deleteAChat = (id) => {
        fetch(`http://localhost:3000/chats/${id}`, {
            method: "DELETE"
        })
            .then(r => r.json())
            .then(resObj => {
                console.log("deleted")
                const newChats = this.state.allChats.filter((chat) => {
                    return chat.id !== resObj.id
                })
                this.setState({
                    allChats: newChats
                })
            })
    }

    onChatSubmit = (event) => {
        event.preventDefault()
        fetch("http://localhost:3000/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message: {
                    user_id: this.props.userID,
                    chat_id: this.state.thisChat.id,
                    content: event.target.message.value
                }
            })
        })
            .then(r => r.json())
            .then(resObj => {
                this.setState({
                    thisChatMessages: [...this.state.thisChatMessages, resObj],
                    message: ""
                })
            })

        // event.target.message.value.clear()
    }

    onMessageChange = (event) => {
        this.setState({
            message: event.target.value
        })
    }

    renderUserProfile = (renderParams) => {
        // console.log(renderParams)
        const slug = renderParams.match.params.slug
        const user = this.state.allUsers.find(user => user.username === slug)
        if (user) {

            return <UserProfile thisUserID={user.id} deleteAUser={this.deleteAUser} userID={this.props.userID} addAFriend={this.addAFriend} removeAFriend={this.removeAFriend} myFriends={this.state.myFriends} addAChat={this.addAChat} currentUser={user} currentUserInterests={user.interests}/>
            
        }
    }

    render(){
        console.log(this.state.thisChatMessages)
        // const profileRoutes = this.state.allUsers.map((user) => {
        //     return <Route path={`/home/${user.username}`} render={(props) => <UserProfile {...props} thisUserID={user.id} resetRedirect={this.resetRedirect} deleteAUser={this.deleteAUser} userID={this.props.userID} addAFriend={this.addAFriend} removeAFriend={this.removeAFriend} myFriends={this.state.myFriends} addAChat={this.addAChat} />} exact />
        // })
        return(
            <div>
                <NavBar showProfile={this.props.showProfile} handleProfileClick={this.props.handleProfileClick} handleHomeClick={this.props.handleHomeClick} onClick={this.props.logOutClick} username={this.state.username}/>
                <FriendsChatPanel userID={this.props.userID} friends={this.state.myFriends} setID={this.setID} username={this.state.username} showChatPanel={this.state.showChatPanel} selectedUserID={this.state.selectedUserID} startChat={this.startChat} startChatFromLI={this.startChatFromLI} allChats={this.state.allChats} thisChat={this.state.thisChat} deleteAChat={this.deleteAChat} thisChatMessages={this.state.thisChatMessages} onChatSubmit={this.onChatSubmit} message={this.state.message} onMessageChange={this.onMessageChange}/>
                <div className="main-div">
                    <Switch>
                        <Route exact path="/home/my-profile/edit" render={(props) => <EditProfile {...props} userID={this.props.userID} />} />
                        <Route exact path="/home/my-profile" render={(props) => <MyProfile {...props} selectedUserID={this.state.selectedUserID} resetRedirect={this.resetRedirect} deleteAUser={this.deleteAUser} userID={this.props.userID} interests={this.props.interests} />} />
                       {/* {profileRoutes} */}
                        <Route path="/home/user-profile/:slug" render={ this.renderUserProfile } />
                        {/* <Route path="/home/user-profile" render={(props) => <UserProfile {...props} selectedUserID={this.state.selectedUserID} resetRedirect={this.resetRedirect} deleteAUser={this.deleteAUser} userID={this.props.userID} addAFriend={this.addAFriend} removeAFriend={this.removeAFriend} myFriends={this.state.myFriends} startChat={this.startChat}/>} /> */}
                        <Route exact path="/home/search" render={(props) => <Search {...props} interests={this.props.interests} allUsers={this.state.allUsers} setID={this.setID} userID={this.props.userID} />} />
                        <Route exact path="/home/calendar" render={(props) => <CalendarPage {...props} userID={this.props.userID} myFriends={this.state.myFriends} />} />
                        <Route exact path="/home" render={(props) => <HomePage {...props} allUsers={this.state.allUsers} selectedUserID={this.state.selectedUserID} setID={this.setID} zip_code={this.state.zip_code} userID={this.props.userID} interests={this.state.interests} />} />
                    </Switch>
                </div>
                
            </div>
        )
    }
}