package com.quizapp.service;

import com.quizapp.model.FriendRequest;
import com.quizapp.model.User;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.quizapp.dto.FriendRequestDTO;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final FriendRequestRepository friendRequestRepository;

    @Transactional
    public void addFriend(String username, String friendUsername) {
        if (username.equals(friendUsername)) {
            throw new IllegalArgumentException("You cannot add yourself as a friend.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Friend not found: " + friendUsername));

        user.getFriends().add(friend);
        friend.getFriends().add(user); // Make the relationship bidirectional

        userRepository.save(user);
        userRepository.save(friend);
    }

    @Transactional(readOnly = true)
    public Set<String> getFriends(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return user.getFriends().stream()
                .map(User::getUsername)
                .collect(Collectors.toSet());
    }

    @Transactional
    public String sendFriendRequest(String requesterUsername, String addresseeUsername) {
        if (requesterUsername.equals(addresseeUsername)) {
            return "You cannot add yourself as a friend.";
        }
        User requester = userRepository.findByUsername(requesterUsername).orElseThrow(() -> new RuntimeException("User not found: " + requesterUsername));
        User addressee = userRepository.findByUsername(addresseeUsername).orElseThrow(() -> new RuntimeException("User not found: " + addresseeUsername));

        // Check if a request from the addressee to the requester already exists
        Optional<FriendRequest> reverseRequest = friendRequestRepository.findByRequesterAndAddressee(addressee, requester);
        if (reverseRequest.isPresent()) {
            if (reverseRequest.get().getStatus() == FriendRequest.Status.PENDING) {
                // If a pending request exists, accept it automatically
                return acceptFriendRequest(reverseRequest.get().getId(), requesterUsername);
            } else if (reverseRequest.get().getStatus() == FriendRequest.Status.ACCEPTED) {
                return "You are already friends.";
            }
        }
        
        // Check if a request from the requester to the addressee already exists
        Optional<FriendRequest> existingRequest = friendRequestRepository.findByRequesterAndAddressee(requester, addressee);
        if (existingRequest.isPresent()) {
            return "Friend request already sent.";
        }

        FriendRequest newRequest = new FriendRequest();
        newRequest.setRequester(requester);
        newRequest.setAddressee(addressee);
        newRequest.setStatus(FriendRequest.Status.PENDING);
        friendRequestRepository.save(newRequest);
        return "Friend request sent.";
    }

    @Transactional
    public String acceptFriendRequest(Long requestId, String addresseeUsername) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found."));
        if (!request.getAddressee().getUsername().equals(addresseeUsername)) {
            return "You are not authorized to accept this request.";
        }
        if (request.getStatus() == FriendRequest.Status.ACCEPTED) {
            return "Already accepted.";
        }
        request.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(request);
        return "Friend request accepted.";
    }

    @Transactional(readOnly = true)
    public List<String> getFriendList(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        List<FriendRequest> accepted = friendRequestRepository.findAcceptedFriendships(user, FriendRequest.Status.ACCEPTED);
        return accepted.stream()
                .map(fr -> fr.getRequester().getUsername().equals(username) ? fr.getAddressee().getUsername() : fr.getRequester().getUsername())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> getPendingRequests(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found: " + username));
        return friendRequestRepository.findByAddresseeAndStatus(user, FriendRequest.Status.PENDING)
                .stream()
                .map(FriendRequestDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> searchUsers(String query, String currentUsername) {
        return userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot(query, currentUsername)
                .stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }
} 