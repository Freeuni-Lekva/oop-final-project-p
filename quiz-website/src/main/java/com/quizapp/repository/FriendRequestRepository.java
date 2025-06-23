package com.quizapp.repository;

import com.quizapp.model.FriendRequest;
import com.quizapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByAddresseeAndStatus(User addressee, FriendRequest.Status status);

    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.requester = :user OR fr.addressee = :user) AND fr.status = :status")
    List<FriendRequest> findAcceptedFriendships(@Param("user") User user, @Param("status") FriendRequest.Status status);

    Optional<FriendRequest> findByRequesterAndAddressee(User requester, User addressee);
    List<FriendRequest> findByAddressee(User addressee);
    List<FriendRequest> findByRequester(User requester);
}