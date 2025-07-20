package Finance.Tracker.Finance.Tracker.repository;


import Finance.Tracker.Finance.Tracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(
            Long userId, Long categoryId, Integer month, Integer year);
    List<Budget> findByUserId(Long userId);
}