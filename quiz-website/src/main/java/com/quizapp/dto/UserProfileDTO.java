package com.quizapp.dto;

public class UserProfileDTO {
    private Long id;
    private String username;
    private String friendStatus; // NONE, FRIENDS, PENDING
    private String currentUser;

    public UserProfileDTO() {}

    public UserProfileDTO(Long id, String username, String friendStatus, String currentUser) {
        this.id = id;
        this.username = username;
        this.friendStatus = friendStatus;
        this.currentUser = currentUser;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFriendStatus() { return friendStatus; }
    public void setFriendStatus(String friendStatus) { this.friendStatus = friendStatus; }

    public String getCurrentUser() { return currentUser; }
    public void setCurrentUser(String currentUser) { this.currentUser = currentUser; }
}