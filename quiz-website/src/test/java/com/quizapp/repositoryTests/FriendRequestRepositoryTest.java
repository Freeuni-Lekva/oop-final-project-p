package com.quizapp.repositoryTests;

import com.quizapp.model.FriendRequest;
import com.quizapp.model.User;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class FriendRequestRepositoryTest {
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should save and find friend request by addressee and status")
    void testFindByAddresseeAndStatus() {
        User requester = new User();
        requester.setUsername("requester");
        requester.setPasswordHash("pw");
        userRepository.save(requester);

        User addressee = new User();
        addressee.setUsername("addressee");
        addressee.setPasswordHash("pw");
        userRepository.save(addressee);

        FriendRequest request = new FriendRequest();
        request.setRequester(requester);
        request.setAddressee(addressee);
        request.setStatus(FriendRequest.Status.PENDING);
        friendRequestRepository.save(request);

        List<FriendRequest> found = friendRequestRepository.findByAddresseeAndStatus(addressee, FriendRequest.Status.PENDING);
        assertThat(found).isNotEmpty();
        assertThat(found.get(0).getRequester().getUsername()).isEqualTo("requester");
    }
}