package Finance.Tracker.Finance.Tracker.service;

import Finance.Tracker.Finance.Tracker.dto.TransactionDto;
import Finance.Tracker.Finance.Tracker.dto.TransactionType;
import Finance.Tracker.Finance.Tracker.model.Category;
import Finance.Tracker.Finance.Tracker.model.Transaction;
import Finance.Tracker.Finance.Tracker.model.User;
import Finance.Tracker.Finance.Tracker.repository.CategoryRepository;
import Finance.Tracker.Finance.Tracker.repository.TransactionRepository;
import Finance.Tracker.Finance.Tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public Page<TransactionDto> getAllTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId, pageable);
        return transactions.map(this::convertToDto);
    }

    public Page<TransactionDto> getTransactionsWithFilters(Long userId, LocalDate startDate,
                                                           LocalDate endDate, Long categoryId,
                                                           TransactionType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionRepository.findTransactionsWithFilters(
                userId, startDate, endDate, categoryId, type, pageable);
        return transactions.map(this::convertToDto);
    }

    public TransactionDto createTransaction(Long userId, TransactionDto transactionDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(transactionDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to user");
        }
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setType(transactionDto.getType());
        transaction.setTransactionDate(transactionDto.getTransactionDate());

        Transaction savedTransaction = transactionRepository.save(transaction);
        return convertToDto(savedTransaction);
    }

    public TransactionDto updateTransaction(Long userId, Long transactionId, TransactionDto transactionDto) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Transaction does not belong to user");
        }

        if (transactionDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(transactionDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            if (!category.getUser().getId().equals(userId)) {
                throw new RuntimeException("Category does not belong to user");
            }
            transaction.setCategory(category);
        }

        if (transactionDto.getAmount() != null) {
            transaction.setAmount(transactionDto.getAmount());
        }
        if (transactionDto.getDescription() != null) {
            transaction.setDescription(transactionDto.getDescription());
        }
        if (transactionDto.getType() != null) {
            transaction.setType(transactionDto.getType());
        }
        if (transactionDto.getTransactionDate() != null) {
            transaction.setTransactionDate(transactionDto.getTransactionDate());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return convertToDto(updatedTransaction);
    }

    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Transaction does not belong to user");
        }

        transactionRepository.delete(transaction);
    }

    public Optional<TransactionDto> getTransactionById(Long userId, Long transactionId) {
        Optional<Transaction> transaction = transactionRepository.findById(transactionId);

        if (transaction.isPresent() && transaction.get().getUser().getId().equals(userId)) {
            return Optional.of(convertToDto(transaction.get()));
        }

        return Optional.empty();
    }

    private TransactionDto convertToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setType(transaction.getType());
        dto.setCategoryId(transaction.getCategory().getId());
        dto.setCategoryName(transaction.getCategory().getName());
        dto.setTransactionDate(transaction.getTransactionDate());
        return dto;
    }
}
