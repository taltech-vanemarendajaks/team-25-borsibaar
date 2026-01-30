package com.borsibaar.service;

import com.borsibaar.dto.AddStockRequestDto;
import com.borsibaar.dto.InventoryResponseDto;
import com.borsibaar.dto.InventoryTransactionResponseDto;
import com.borsibaar.dto.RemoveStockRequestDto;
import com.borsibaar.dto.AdjustStockRequestDto;
import com.borsibaar.dto.StationSalesStatsResponseDto;
import com.borsibaar.dto.UserSalesStatsResponseDto;
import com.borsibaar.entity.BarStation;
import com.borsibaar.entity.Inventory;
import com.borsibaar.entity.InventoryTransaction;
import com.borsibaar.entity.Product;
import com.borsibaar.entity.User;
import com.borsibaar.mapper.InventoryMapper;
import com.borsibaar.repository.BarStationRepository;
import com.borsibaar.repository.InventoryRepository;
import com.borsibaar.repository.InventoryTransactionRepository;
import com.borsibaar.repository.ProductRepository;
import com.borsibaar.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BarStationRepository barStationRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private ClientRegistrationRepository clientRegistrationRepository;

    @InjectMocks private InventoryService inventoryService;

    private final UUID userId = UUID.randomUUID();

    @Test
    void addStock_CreatesInventoryIfMissing() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.valueOf(2));
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> { Inventory i = inv.getArgument(0); i.setId(77L); return i; });
        when(inventoryMapper.toResponse(any())).thenAnswer(inv -> {
            Inventory i = inv.getArgument(0); return new InventoryResponseDto(i.getId(), i.getOrganizationId(), i.getProductId(), "P", i.getQuantity(), i.getAdjustedPrice(), product.getDescription(), null, null, null, i.getUpdatedAt().toString()); });

        AddStockRequestDto request = new AddStockRequestDto(5L, BigDecimal.valueOf(10), "Notes");
        InventoryResponseDto dto = inventoryService.addStock(request, userId, 1L);
        assertEquals(BigDecimal.valueOf(10), dto.quantity());
        verify(inventoryTransactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    void addStock_ProductInactive_ThrowsGone() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(false);
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        AddStockRequestDto request = new AddStockRequestDto(5L, BigDecimal.ONE, null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.addStock(request, userId, 1L));
        assertEquals(HttpStatus.GONE, ex.getStatusCode());
    }

    @Test
    void removeStock_Insufficient_ThrowsBadRequest() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.ONE);
        Inventory inv = new Inventory(); inv.setId(9L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(BigDecimal.valueOf(2)); inv.setAdjustedPrice(BigDecimal.ONE); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        RemoveStockRequestDto request = new RemoveStockRequestDto(5L, BigDecimal.valueOf(5), null, null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.removeStock(request, userId, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void adjustStock_Success_CreatesTransaction() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.valueOf(2));
        Inventory inv = new Inventory(); inv.setId(9L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(BigDecimal.valueOf(5)); inv.setAdjustedPrice(BigDecimal.valueOf(2)); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(any(Inventory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryMapper.toResponse(any())).thenAnswer(a -> {
            Inventory i = a.getArgument(0); return new InventoryResponseDto(i.getId(), i.getOrganizationId(), i.getProductId(), "Prod", i.getQuantity(), i.getAdjustedPrice(), product.getDescription(), null, null, null, i.getUpdatedAt().toString()); });

        AdjustStockRequestDto request = new AdjustStockRequestDto(5L, BigDecimal.valueOf(8), "Adj");
        InventoryResponseDto dto = inventoryService.adjustStock(request, userId, 1L);
        assertEquals(BigDecimal.valueOf(8), dto.quantity());
        verify(inventoryTransactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    void getByOrganization_FiltersInactiveProducts() {
        Inventory inv1 = new Inventory(); inv1.setId(1L); inv1.setOrganizationId(1L); inv1.setProductId(10L); inv1.setQuantity(BigDecimal.ONE); inv1.setUpdatedAt(OffsetDateTime.now());
        Inventory inv2 = new Inventory(); inv2.setId(2L); inv2.setOrganizationId(1L); inv2.setProductId(11L); inv2.setQuantity(BigDecimal.ONE); inv2.setUpdatedAt(OffsetDateTime.now());
        when(inventoryRepository.findByOrganizationId(1L)).thenReturn(List.of(inv1, inv2));
        Product p1 = new Product(); p1.setId(10L); p1.setActive(true); p1.setBasePrice(BigDecimal.ONE); p1.setName("A");
        Product p2 = new Product(); p2.setId(11L); p2.setActive(false); p2.setBasePrice(BigDecimal.ONE); p2.setName("B");
        when(productRepository.findById(10L)).thenReturn(Optional.of(p1));
        when(productRepository.findById(11L)).thenReturn(Optional.of(p2));
        when(inventoryMapper.toResponse(inv1)).thenReturn(new InventoryResponseDto(1L,1L,10L,"A",BigDecimal.ONE,BigDecimal.ONE, "abc", null,null,null,OffsetDateTime.now().toString()));
        List<InventoryResponseDto> result = inventoryService.getByOrganization(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getByProductAndOrganization_ProductInactive_Gone() {
        Inventory inv = new Inventory(); inv.setId(1L); inv.setOrganizationId(1L); inv.setProductId(10L); inv.setQuantity(BigDecimal.ONE); inv.setUpdatedAt(OffsetDateTime.now());
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 10L)).thenReturn(Optional.of(inv));
        Product p = new Product(); p.setId(10L); p.setActive(false); p.setBasePrice(BigDecimal.ONE); p.setName("A");
        when(productRepository.findById(10L)).thenReturn(Optional.of(p));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.getByProductAndOrganization(10L, 1L));
        assertEquals(HttpStatus.GONE, ex.getStatusCode());
    }

    @Test
    void addStock_ProductWrongOrg_Forbidden() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(2L); product.setActive(true);
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        AddStockRequestDto request = new AddStockRequestDto(5L, BigDecimal.ONE, null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.addStock(request, userId, 1L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void removeStock_Success_CreatesNegativeTransaction() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(new BigDecimal("2.00"));
        Inventory inv = new Inventory(); inv.setId(10L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(new BigDecimal("10")); inv.setAdjustedPrice(new BigDecimal("2.00")); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(a -> a.getArgument(0));
        when(inventoryMapper.toResponse(any())).thenAnswer(a -> { Inventory i = a.getArgument(0); return new InventoryResponseDto(i.getId(), i.getOrganizationId(), i.getProductId(), "Prod", i.getQuantity(), i.getAdjustedPrice(), product.getDescription(), null, null, null, i.getUpdatedAt().toString());});

        RemoveStockRequestDto request = new RemoveStockRequestDto(5L, new BigDecimal("3"), "sale-1", "note");
        InventoryResponseDto dto = inventoryService.removeStock(request, userId, 1L);
        assertEquals(new BigDecimal("7"), dto.quantity());
        ArgumentCaptor<InventoryTransaction> txCap = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository).save(txCap.capture());
        assertEquals(new BigDecimal("-3"), txCap.getValue().getQuantityChange());
        assertEquals("sale-1", txCap.getValue().getReferenceId());
    }

    /**
     * Testib Update Price (hinna käsitsi muutmine) õnnestumist.
     * <p>
     * <b>Testitav:</b> Kui toode ja inventuur on olemas ning uus hind on min/max piirides,
     * uuendatakse inventuuri praegune hind, salvestatakse ja luuakse ADJUSTMENT transaktsioon.
     * <p>
     * <b>Mock andmed:</b>
     * <ul>
     *   <li>Product: id=5, org=1, Cola, basePrice=2.00, minPrice=1.00, maxPrice=5.00</li>
     *   <li>Inventory: id=10, productId=5, quantity=10, adjustedPrice=2.00 (praegune hind)</li>
     *   <li>Uus hind: 3.50 (min ja max vahel), märkused: "Manual"</li>
     * </ul>
     * <b>Kontrollitakse:</b> Tagastatakse DTO uue hinnaga; inventuur save kutsutakse;
     * transaktsioonil type=ADJUSTMENT, priceBefore=2.00, priceAfter=3.50.
     */
    @Test
    void updatePrice_Success_UpdatesPriceAndCreatesTransaction() {
        System.out.println("""
            -------- InventoryServiceTest: updatePrice_Success --------
            Testitav: Hinna käsitsi muutmine (Update Price) – uus hind min/max piirides.
            Mock andmed:
              Product: id=5, orgId=1, name=Cola, basePrice=2.00, minPrice=1.00, maxPrice=5.00
              Inventory: id=10, productId=5, quantity=10, adjustedPrice=2.00 (praegune hind)
              Sisend: newPrice=3.50, notes=Manual, userId=..., orgId=1
            Kontrollitakse: DTO.unitPrice=3.50; inventuur save; ADJUSTMENT tx priceBefore=2.00, priceAfter=3.50
            ----------------------------------------------------------""");

        // --- Mock andmed: toode ---
        Long orgId = 1L;
        Long productId = 5L;
        Product product = new Product();
        product.setId(productId);
        product.setOrganizationId(orgId);
        product.setActive(true);
        product.setName("Cola");
        product.setDescription("Drink");
        product.setBasePrice(new BigDecimal("2.00"));
        product.setMinPrice(new BigDecimal("1.00"));
        product.setMaxPrice(new BigDecimal("5.00"));

        // --- Mock andmed: inventuur (praegune hind 2.00) ---
        Inventory inv = new Inventory();
        inv.setId(10L);
        inv.setOrganizationId(orgId);
        inv.setProduct(product);
        inv.setProductId(productId);
        inv.setQuantity(new BigDecimal("10"));
        inv.setAdjustedPrice(new BigDecimal("2.00"));
        inv.setUpdatedAt(OffsetDateTime.now());

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(orgId, productId)).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(a -> a.getArgument(0));
        when(inventoryMapper.toResponse(any())).thenAnswer(a -> {
            Inventory i = a.getArgument(0);
            return new InventoryResponseDto(i.getId(), i.getOrganizationId(), i.getProductId(), "Cola",
                i.getQuantity(), i.getAdjustedPrice(), "Drink", product.getBasePrice(),
                product.getMinPrice(), product.getMaxPrice(), i.getUpdatedAt().toString());
        });

        // --- Käivitus: uus hind 3.50, märkused "Manual" ---
        BigDecimal newPrice = new BigDecimal("3.50");
        InventoryResponseDto dto = inventoryService.updatePrice(productId, newPrice, "Manual", userId, orgId);

        // --- Kontrollid: DTO sisaldab uut hinda ja nime ---
        assertEquals(newPrice, dto.unitPrice());
        assertEquals("Cola", dto.productName());
        verify(inventoryRepository).save(any(Inventory.class));
        // --- Kontrollid: luuakse ADJUSTMENT transaktsioon õigete hindadega ---
        ArgumentCaptor<InventoryTransaction> txCap = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository).save(txCap.capture());
        assertEquals("ADJUSTMENT", txCap.getValue().getTransactionType());
        assertEquals(new BigDecimal("2.00"), txCap.getValue().getPriceBefore());
        assertEquals(newPrice, txCap.getValue().getPriceAfter());

        System.out.println("updatePrice_Success: KÕIK KONTROLLID LÄBITUD.");
    }

    /**
     * Testib Update Price – uus hind alla miinimumi: viskab BAD_REQUEST.
     * Mock: toode minPrice=2.00, uus hind 1.00. Kontrollitakse: status BAD_REQUEST, sõnum sisaldab "below minimum".
     */
    @Test
    void updatePrice_BelowMin_ThrowsBadRequest() {
        System.out.println("""
            -------- InventoryServiceTest: updatePrice_BelowMin_ThrowsBadRequest --------
            Testitav: Uus hind alla minPrice -> BAD_REQUEST.
            Mock: Product minPrice=2.00, Inventory adjustedPrice=2.00. Sisend: newPrice=1.00.
            Kontrollitakse: ResponseStatusException BAD_REQUEST, sõnum "below minimum price"
            ------------------------------------------------------------------------------""");

        Long orgId = 1L;
        Long productId = 5L;
        Product product = new Product();
        product.setId(productId);
        product.setOrganizationId(orgId);
        product.setActive(true);
        product.setBasePrice(new BigDecimal("2.00"));
        product.setMinPrice(new BigDecimal("2.00"));
        product.setMaxPrice(new BigDecimal("5.00"));

        Inventory inv = new Inventory();
        inv.setId(9L);
        inv.setOrganizationId(orgId);
        inv.setProduct(product);
        inv.setProductId(productId);
        inv.setQuantity(BigDecimal.ONE);
        inv.setAdjustedPrice(new BigDecimal("2.00"));
        inv.setUpdatedAt(OffsetDateTime.now());

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(orgId, productId)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            inventoryService.updatePrice(productId, new BigDecimal("1.00"), null, userId, orgId));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertNotNull(ex.getReason());
        assertTrue(ex.getReason().contains("below minimum price"));

        verify(inventoryRepository, never()).save(any(Inventory.class));
        verify(inventoryTransactionRepository, never()).save(any(InventoryTransaction.class));
        System.out.println("updatePrice_BelowMin_ThrowsBadRequest: KÕIK KONTROLLID LÄBITUD.");
    }

    /**
     * Testib Update Price – uus hind üle maksimumi: viskab BAD_REQUEST.
     * Mock: toode maxPrice=3.00, uus hind 5.00. Kontrollitakse: status BAD_REQUEST, sõnum sisaldab "above maximum".
     */
    @Test
    void updatePrice_AboveMax_ThrowsBadRequest() {
        System.out.println("""
            -------- InventoryServiceTest: updatePrice_AboveMax_ThrowsBadRequest --------
            Testitav: Uus hind üle maxPrice -> BAD_REQUEST.
            Mock: Product maxPrice=3.00, Inventory adjustedPrice=2.00. Sisend: newPrice=5.00.
            Kontrollitakse: ResponseStatusException BAD_REQUEST, sõnum "above maximum price"
            ------------------------------------------------------------------------------""");

        Long orgId = 1L;
        Long productId = 5L;
        Product product = new Product();
        product.setId(productId);
        product.setOrganizationId(orgId);
        product.setActive(true);
        product.setBasePrice(new BigDecimal("2.00"));
        product.setMinPrice(new BigDecimal("1.00"));
        product.setMaxPrice(new BigDecimal("3.00"));

        Inventory inv = new Inventory();
        inv.setId(9L);
        inv.setOrganizationId(orgId);
        inv.setProduct(product);
        inv.setProductId(productId);
        inv.setQuantity(BigDecimal.ONE);
        inv.setAdjustedPrice(new BigDecimal("2.00"));
        inv.setUpdatedAt(OffsetDateTime.now());

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(orgId, productId)).thenReturn(Optional.of(inv));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            inventoryService.updatePrice(productId, new BigDecimal("5.00"), null, userId, orgId));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertNotNull(ex.getReason());
        assertTrue(ex.getReason().contains("above maximum price"));

        verify(inventoryRepository, never()).save(any(Inventory.class));
        verify(inventoryTransactionRepository, never()).save(any(InventoryTransaction.class));
        System.out.println("updatePrice_AboveMax_ThrowsBadRequest: KÕIK KONTROLLID LÄBITUD.");
    }

    @Test
    void getTransactionHistory_MapsUserInfo() {
        Inventory inv = new Inventory(); inv.setId(100L); inv.setOrganizationId(1L); inv.setProductId(10L);
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 10L)).thenReturn(Optional.of(inv));
        UUID uid = UUID.randomUUID();
        InventoryTransaction tx = new InventoryTransaction();
        tx.setId(1L); tx.setInventory(inv); tx.setInventoryId(inv.getId()); tx.setTransactionType("SALE");
        tx.setQuantityChange(new BigDecimal("-1")); tx.setQuantityBefore(BigDecimal.TEN); tx.setQuantityAfter(new BigDecimal("9"));
        tx.setPriceBefore(BigDecimal.ONE); tx.setPriceAfter(BigDecimal.ONE); tx.setReferenceId("ref"); tx.setNotes("n");
        tx.setCreatedBy(uid); tx.setCreatedAt(OffsetDateTime.now());
        when(inventoryTransactionRepository.findByInventoryIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(tx));
        User user = new User(); user.setId(uid); user.setName("Alice"); user.setEmail("a@b.c");
        when(userRepository.findAllById(anyList())).thenReturn(List.of(user));

        List<InventoryTransactionResponseDto> result = inventoryService.getTransactionHistory(10L, 1L);
        assertEquals(1, result.size());
        assertEquals(uid.toString(), result.get(0).createdBy());
        assertEquals("Alice", result.get(0).createdByName());
    }

    @Test
    void getUserSalesStats_ComputesCountsAndRevenue() {
        Long orgId = 1L;
        UUID uid = UUID.randomUUID();
        Long stationId = 7L;
        // two transactions for same user/station, different inventories
        InventoryTransaction t1 = new InventoryTransaction(); t1.setInventoryId(11L); t1.setTransactionType("SALE"); t1.setReferenceId("o1"); t1.setQuantityChange(new BigDecimal("-2")); t1.setCreatedBy(uid); t1.setBarStationId(stationId);
        InventoryTransaction t2 = new InventoryTransaction(); t2.setInventoryId(12L); t2.setTransactionType("SALE"); t2.setReferenceId("o2"); t2.setQuantityChange(new BigDecimal("-1")); t2.setCreatedBy(uid); t2.setBarStationId(stationId);
        when(inventoryTransactionRepository.findSaleTransactionsByOrganizationId(orgId)).thenReturn(List.of(t1, t2));

        // inventories map to products with base prices
        Inventory inv1 = new Inventory(); inv1.setId(11L); inv1.setProductId(101L);
        Inventory inv2 = new Inventory(); inv2.setId(12L); inv2.setProductId(102L);
        when(inventoryRepository.findById(11L)).thenReturn(Optional.of(inv1));
        when(inventoryRepository.findById(12L)).thenReturn(Optional.of(inv2));
        Product p1 = new Product(); p1.setId(101L); p1.setBasePrice(new BigDecimal("3.00"));
        Product p2 = new Product(); p2.setId(102L); p2.setBasePrice(new BigDecimal("5.00"));
        when(productRepository.findById(101L)).thenReturn(Optional.of(p1));
        when(productRepository.findById(102L)).thenReturn(Optional.of(p2));

        User user = new User(); user.setId(uid); user.setName("Bob"); user.setEmail("b@c.d");
        when(userRepository.findAllById(anyList())).thenReturn(List.of(user));
        BarStation station = new BarStation(); station.setId(stationId); station.setName("Main");
        when(barStationRepository.findAllById(anyList())).thenReturn(List.of(station));

        List<UserSalesStatsResponseDto> stats = inventoryService.getUserSalesStats(orgId);
        assertEquals(1, stats.size());
        UserSalesStatsResponseDto s = stats.get(0);
        assertEquals(2L, s.salesCount());
        // revenue = 2*3 + 1*5 = 11
        assertEquals(new BigDecimal("11.00"), s.totalRevenue());
        assertEquals("Bob", s.userName());
    }

    @Test
    void getStationSalesStats_ComputesCountsAndRevenue() {
        Long orgId = 1L;
        Long stationId = 7L;
        InventoryTransaction t1 = new InventoryTransaction(); t1.setInventoryId(11L); t1.setTransactionType("SALE"); t1.setReferenceId("o1"); t1.setQuantityChange(new BigDecimal("-2")); t1.setBarStationId(stationId);
        InventoryTransaction t2 = new InventoryTransaction(); t2.setInventoryId(12L); t2.setTransactionType("SALE"); t2.setReferenceId("o2"); t2.setQuantityChange(new BigDecimal("-1")); t2.setBarStationId(stationId);
        when(inventoryTransactionRepository.findSaleTransactionsByOrganizationId(orgId)).thenReturn(List.of(t1, t2));

        Inventory inv1 = new Inventory(); inv1.setId(11L); inv1.setProductId(101L);
        Inventory inv2 = new Inventory(); inv2.setId(12L); inv2.setProductId(102L);
        when(inventoryRepository.findById(11L)).thenReturn(Optional.of(inv1));
        when(inventoryRepository.findById(12L)).thenReturn(Optional.of(inv2));
        Product p1 = new Product(); p1.setId(101L); p1.setBasePrice(new BigDecimal("3.00"));
        Product p2 = new Product(); p2.setId(102L); p2.setBasePrice(new BigDecimal("5.00"));
        when(productRepository.findById(101L)).thenReturn(Optional.of(p1));
        when(productRepository.findById(102L)).thenReturn(Optional.of(p2));

        BarStation station = new BarStation(); station.setId(stationId); station.setName("Main");
        when(barStationRepository.findAllById(anyList())).thenReturn(List.of(station));

        List<StationSalesStatsResponseDto> stats = inventoryService.getStationSalesStats(orgId);
        assertEquals(1, stats.size());
        StationSalesStatsResponseDto s = stats.get(0);
        assertEquals(2L, s.salesCount());
        assertEquals(new BigDecimal("11.00"), s.totalRevenue());
        assertEquals("Main", s.barStationName());
    }
}
