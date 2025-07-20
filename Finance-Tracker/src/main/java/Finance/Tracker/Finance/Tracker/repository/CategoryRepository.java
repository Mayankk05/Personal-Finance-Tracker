package Finance.Tracker.Finance.Tracker.repository;


import Finance.Tracker.Finance.Tracker.dto.TransactionType;
import Finance.Tracker.Finance.Tracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByName(Long userId);
    List<Category> findByUserIdAndType(Long userId, TransactionType type);
    boolean existsByNameAndUserId(String name, Long userId);
}