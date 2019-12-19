import React, { Component } from 'react'
import EditProfile from './EditProfile'
import MyProfile from './MyProfile'
import UserProfile from './UserProfile'
import HomePage from './HomePage'
import Search from './Search'
import NavBar from './NavBar'
import FriendsChatPanel from './FriendsChatPanel'
import { Route, Switch, Redirect } from 'react-router-dom'

export default class MainDiv extends Component {

    state = {
        allUsers: [],
        selectedUserID: null,
        redirect: false,
        username: "",
        zip_code: 0,
        interests: [],
        myFriends: []
    }

    setID = (id) => {
        this.setState({
            selectedUserID: id,
            redirect: true
        })
    }

    resetRedirect = () => {
        this.setState({
            redirect: false
        })
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
            console.log(resObj)
            this.setState({
                username: resObj.username,
                zip_code: resObj.zip_code,
                interests: resObj.interests,
                myFriends: resObj.all_friendships
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

    addAFriend = () => {
        fetch('http://localhost:3000/friendships', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                friendship: {
                    user1_id: this.props.userID,
                    user2_id: this.state.selectedUserID
                }
                
            })
        })
        .then( r => r.json())
        .then(resObj => {
            this.setState({
                myFriends: [...this.state.myFriends, resObj]
            })
        })
    }

    render(){
        return(
            <div>
                <NavBar showProfile={this.props.showProfile} handleProfileClick={this.props.handleProfileClick} handleHomeClick={this.props.handleHomeClick} onClick={this.props.logOutClick} username={this.state.username}/>
                <FriendsChatPanel userID={this.props.userID} friends={this.state.myFriends} setID={this.setID}/>
                {this.state.redirect ? (<Redirect to="/home/user-profile"/>) : ""}
                <div className="main-div">
                    <Switch>
                        <Route strict path="/home/my-profile/edit" render={(props) => <EditProfile {...props} userID={this.props.userID} />} />
                        <Route strict path="/home/my-profile" render={(props) => <MyProfile {...props} selectedUserID={this.state.selectedUserID} resetRedirect={this.resetRedirect} deleteAUser={this.deleteAUser} userID={this.props.userID} interests={this.props.interests} />} />
                        <Route strict path="/home/user-profile" render={(props) => <UserProfile {...props} selectedUserID={this.state.selectedUserID} resetRedirect={this.resetRedirect} deleteAUser={this.deleteAUser} userID={this.props.userID} addAFriend={this.addAFriend}/>} />
                        <Route strict path="/home/search" render={(props) => <Search {...props} interests={this.props.interests} allUsers={this.state.allUsers} setID={this.setID} userID={this.props.userID} />} />
                        <Route strict path="/home" render={(props) => <HomePage {...props} allUsers={this.state.allUsers} selectedUserID={this.state.selectedUserID} setID={this.setID} zip_code={this.state.zip_code} userID={this.props.userID} interests={this.state.interests} />} />

                    </Switch>
                </div>
                
            </div>
        )
    }
}