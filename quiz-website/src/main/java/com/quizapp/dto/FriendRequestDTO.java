package com.quizapp.dto;

import com.quizapp.model.FriendRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendRequestDTO {
    private Long id;
    private String requesterUsername;

    public FriendRequestDTO(FriendRequest friendRequest) {
        this.id = friendRequest.getId();
        this.requesterUsername = friendRequest.getRequester().getUsername();
    }
}