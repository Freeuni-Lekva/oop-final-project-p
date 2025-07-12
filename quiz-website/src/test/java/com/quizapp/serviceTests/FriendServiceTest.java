package com.quizapp.serviceTests;

import com.quizapp.model.FriendRequest;
import com.quizapp.model.User;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.service.FriendService;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FriendServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserService userService;
    @Mock private FriendRequestRepository friendRequestRepository;

    @InjectMocks private FriendService friendService;

    private User requester;
    private User addressee;

    @BeforeEach
    void setup() {
        requester = new User();
        requester.setId(1L);
        requester.setUsername("requester");
        requester.setPasswordHash("pw");

        addressee = new User();
        addressee.setId(2L);
        addressee.setUsername("addressee");
        addressee.setPasswordHash("pw");
    }

    @Test
    @DisplayName("Should not allow sending friend request to self")
    void testSendFriendRequestToSelf() {
        String result = friendService.sendFriendRequest("requester", "requester");
        assertThat(result).isEqualTo("You cannot add yourself as a friend.");
    }

    @Test
    @DisplayName("Should throw exception if addressee not found")
    void testSendFriendRequestAddresseeNotFound() {
        when(userRepository.findByUsername("requester")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("addressee")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendService.sendFriendRequest("requester", "addressee"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found: addressee");
    }

    @Test
    @DisplayName("Should send friend request if valid")
    void testSendFriendRequestValid() {
        when(userRepository.findByUsername("requester")).thenReturn(Optional.of(requester));
        when(userRepository.findByUsername("addressee")).thenReturn(Optional.of(addressee));
        when(friendRequestRepository.findByRequesterAndAddressee(requester, addressee)).thenReturn(Optional.empty());
        when(friendRequestRepository.findByRequesterAndAddressee(addressee, requester)).thenReturn(Optional.empty());
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(friendRequestRepository.findAcceptedFriendships(requester, FriendRequest.Status.ACCEPTED)).thenReturn(List.of());

        String result = friendService.sendFriendRequest("requester", "addressee");
        assertThat(result).isEqualTo("Friend request sent.");
    }
}