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
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.QuizAttemptRepository;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final FriendRequestRepository friendRequestRepository;
    @org.springframework.beans.factory.annotation.Autowired
    private com.quizapp.repository.QuizRepository quizRepository;
    @org.springframework.beans.factory.annotation.Autowired
    private com.quizapp.repository.QuizAttemptRepository quizAttemptRepository;

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
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + requesterUsername));
        User addressee = userRepository.findByUsername(addresseeUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + addresseeUsername));

        // ✅ Check if already friends (merged from first version)
        List<String> requesterFriends = getFriendList(requesterUsername);
        if (requesterFriends.contains(addresseeUsername)) {
            return "User is already your friend.";
        }

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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return friendRequestRepository.findByAddresseeAndStatus(user, FriendRequest.Status.PENDING)
                .stream()
                .map(FriendRequestDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, String>> searchUsers(String query, String currentUsername) {
        return userRepository.findByUsernameContainingIgnoreCaseAndUsernameNot(query, currentUsername)
                .stream()
                .map(user -> java.util.Map.of("username", user.getUsername()))
                .collect(Collectors.toList());
    }

    @Transactional
    public String rejectFriendRequest(Long requestId, String addresseeUsername) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found."));
        if (!request.getAddressee().getUsername().equals(addresseeUsername)) {
            return "You are not authorized to reject this request.";
        }
        if (request.getStatus() != FriendRequest.Status.PENDING) {
            return "Cannot reject a request that is not pending.";
        }
        friendRequestRepository.delete(request);
        return "Friend request rejected.";
    }

    @Transactional
    public String removeFriend(String username, String friendUsername) {
        if (username.equals(friendUsername)) {
            return "You cannot remove yourself.";
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + friendUsername));

        // Find accepted friendship in either direction
        Optional<FriendRequest> friendship = friendRequestRepository.findByRequesterAndAddressee(user, friend)
                .filter(fr -> fr.getStatus() == FriendRequest.Status.ACCEPTED);
        if (friendship.isEmpty()) {
            friendship = friendRequestRepository.findByRequesterAndAddressee(friend, user)
                    .filter(fr -> fr.getStatus() == FriendRequest.Status.ACCEPTED);
        }
        if (friendship.isEmpty()) {
            return "User is not in your friend list.";
        }
        friendRequestRepository.delete(friendship.get());
        return "Friend removed successfully.";
    }

    public String getFriendStatus(String username1, String username2) {
        if (username1.equals(username2)) return "SELF";
        User user1 = userRepository.findByUsername(username1).orElse(null);
        User user2 = userRepository.findByUsername(username2).orElse(null);
        if (user1 == null || user2 == null) return "NONE";
        // Check if they are friends (accepted request in either direction)
        Optional<FriendRequest> req1 = friendRequestRepository.findByRequesterAndAddressee(user1, user2);
        Optional<FriendRequest> req2 = friendRequestRepository.findByRequesterAndAddressee(user2, user1);
        if (req1.isPresent() && req1.get().getStatus() == FriendRequest.Status.ACCEPTED) return "FRIENDS";
        if (req2.isPresent() && req2.get().getStatus() == FriendRequest.Status.ACCEPTED) return "FRIENDS";
        // Check if there is a pending request
        if (req1.isPresent() && req1.get().getStatus() == FriendRequest.Status.PENDING) return "PENDING";
        if (req2.isPresent() && req2.get().getStatus() == FriendRequest.Status.PENDING) return "PENDING";
        return "NONE";
    }

    @Transactional(readOnly = true)
    public List<User> getFriendUsers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        List<FriendRequest> accepted = friendRequestRepository.findAcceptedFriendships(user, FriendRequest.Status.ACCEPTED);
        return accepted.stream()
                .map(fr -> fr.getRequester().getUsername().equals(username) ? fr.getAddressee() : fr.getRequester())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getFriendStatsWithQuizInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        List<FriendRequest> accepted = friendRequestRepository.findAcceptedFriendships(user, FriendRequest.Status.ACCEPTED);
        List<User> friends = accepted.stream()
                .map(fr -> fr.getRequester().getUsername().equals(username) ? fr.getAddressee() : fr.getRequester())
                .collect(Collectors.toList());
        List<java.util.Map<String, Object>> stats = new java.util.ArrayList<>();
        for (User friend : friends) {
            // Quizzes taken
            var attempts = quizAttemptRepository.findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(friend.getId());
            long numQuizzesTaken = attempts.size();
            double avgPercent = attempts.stream().mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0).average().orElse(0.0);
            // Quizzes created
            var createdQuizzes = quizRepository.findByCreatedBy(friend);
            int numCreated = createdQuizzes.size();
            // Most popular quiz
            String mostPopularQuizTitle = null;
            long mostPopularQuizAttempts = 0;
            for (var quiz : createdQuizzes) {
                long count = quizAttemptRepository.countByQuizIdAndIsCompletedTrueAndIsPracticeModeFalse(quiz.getId());
                if (count > mostPopularQuizAttempts) {
                    mostPopularQuizAttempts = count;
                    mostPopularQuizTitle = quiz.getTitle();
                }
            }
            java.util.Map<String, Object> stat = new java.util.HashMap<>();
            stat.put("username", friend.getUsername());
            stat.put("numQuizzes", numQuizzesTaken);
            stat.put("avgPercent", Math.round(avgPercent * 10.0) / 10.0);
            stat.put("numCreated", numCreated);
            stat.put("mostPopularQuizTitle", mostPopularQuizTitle);
            stat.put("mostPopularQuizAttempts", mostPopularQuizAttempts);
            stats.add(stat);
        }
        return stats;
    }

}