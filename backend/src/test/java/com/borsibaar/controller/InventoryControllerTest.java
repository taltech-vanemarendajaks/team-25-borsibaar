package com.borsibaar.controller;

import com.borsibaar.dto.*;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class InventoryControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private InventoryService inventoryService;

        @MockitoBean
        private ClientRegistrationRepository clientRegistrationRepository;

        @AfterEach
        void tearDown() {
                SecurityContextHolder.clearContext();
        }

        @Test
        void getOrganizationInventory_UsesUserOrg_WhenNoQueryParam() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getOrganizationInventory_UsesUserOrg_WhenNoQueryParam --------
                    Testitav: GET /api/inventory ilma query parameetriteta – kontroller võtab kasutaja orgId (42).
                    Mock: Kasutaja orgId=42, roll=USER. Service getByOrganization(42, null) -> tühi list.
                    Kontrollitakse: status 200; verify getByOrganization(42L, null).
                    -------------------------------------------------------------------------------------------------""");

                User user = userWithOrg(42L, "USER");
                setAuth(user);

                when(inventoryService.getByOrganization(42L, null)).thenReturn(List.of());
                mockMvc.perform(get("/api/inventory"))
                                .andExpect(status().isOk());

                verify(inventoryService).getByOrganization(42L, null);
                System.out.println("getOrganizationInventory_UsesUserOrg_WhenNoQueryParam: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void addStock_ReturnsCreated() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: addStock_ReturnsCreated --------
                    Testitav: POST /api/inventory/add – kontroller kutsub addStock ja tagastab 201.
                    Mock: Kasutaja orgId=1. Keha: productId=10, quantity=5, notes=note. Service tagastab id=100, productName=Cola, quantity=15.
                    Kontrollitakse: status 201; JSON id=100, productName=Cola; verify addStock(..., 1L).
                    ---------------------------------------------------------------------------------------""");

                User user = userWithOrg(1L, "USER");
                setAuth(user);

                AddStockRequestDto req = new AddStockRequestDto(10L, new BigDecimal("5"), "note");
                InventoryResponseDto resp = new InventoryResponseDto(
                                100L,
                                1L,
                                10L,
                                "Cola",
                                new BigDecimal("15"),
                                new BigDecimal("2.50"),
                                "abc",
                                new BigDecimal("2.00"),
                                new BigDecimal("2.00"),
                                new BigDecimal("5.00"),
                                OffsetDateTime.now().toString());
                when(inventoryService.addStock(any(AddStockRequestDto.class), any(UUID.class), eq(1L)))
                                .thenReturn(resp);

                mockMvc.perform(post("/api/inventory/add")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(100))
                                .andExpect(jsonPath("$.productName").value("Cola"));

                verify(inventoryService).addStock(any(AddStockRequestDto.class), any(UUID.class), eq(1L));
                System.out.println("addStock_ReturnsCreated: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void getOrganizationInventory_UsesQueryParams_WhenProvided() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getOrganizationInventory_UsesQueryParams_WhenProvided --------
                    Testitav: GET /api/inventory?organizationId=99&categoryId=7 – kontroller edastab parameetrid.
                    Mock: getByOrganization(99, 7) -> 1 kirje (Cola, orgId=99).
                    Kontrollitakse: status 200; JSON massiiv size=1, $[0].organizationId=99; verify getByOrganization(99, 7).
                    --------------------------------------------------------------------------------------------------------""");

                when(inventoryService.getByOrganization(99L, 7L)).thenReturn(List.of(
                                new InventoryResponseDto(1L, 99L, 10L, "Cola", BigDecimal.ONE, BigDecimal.TEN, "abc",
                                                BigDecimal.TEN, null, null, OffsetDateTime.now().toString())));

                mockMvc.perform(get("/api/inventory").param("organizationId", "99").param("categoryId", "7"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].organizationId").value(99));

                verify(inventoryService).getByOrganization(99L, 7L);
                System.out.println("getOrganizationInventory_UsesQueryParams_WhenProvided: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void getProductInventory_DelegatesToService() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getProductInventory_DelegatesToService --------
                    Testitav: GET /api/inventory/product/10 – kontroller võtab kasutaja orgId (5) ja kutsub getByProductAndOrganization(10, 5).
                    Mock: Kasutaja orgId=5. Service tagastab productId=10, productName=Water, quantity=10.
                    Kontrollitakse: status 200; JSON productId=10; verify getByProductAndOrganization(10, 5).
                    -------------------------------------------------------------------------------------------------""");

                User user = userWithOrg(5L, "USER");
                setAuth(user);
                when(inventoryService.getByProductAndOrganization(10L, 5L)).thenReturn(
                                new InventoryResponseDto(1L, 5L, 10L, "Water", BigDecimal.TEN, BigDecimal.ONE, "abc",
                                                BigDecimal.ONE, null, null, OffsetDateTime.now().toString()));

                mockMvc.perform(get("/api/inventory/product/{productId}", 10L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(10));

                verify(inventoryService).getByProductAndOrganization(10L, 5L);
                System.out.println("getProductInventory_DelegatesToService: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void removeStock_ReturnsOk() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: removeStock_ReturnsOk --------
                    Testitav: POST /api/inventory/remove – kontroller kutsub removeStock ja tagastab 200.
                    Mock: Kasutaja orgId=2. Keha: productId=20, quantity=3, referenceId=ref1, notes=note. Service tagastab productId=20, quantity=7.
                    Kontrollitakse: status 200; JSON productId=20; verify removeStock(..., 2L).
                    ---------------------------------------------------------------------------------""");

                User user = userWithOrg(2L, "USER");
                setAuth(user);
                RemoveStockRequestDto req = new RemoveStockRequestDto(20L, new BigDecimal("3"), "ref1", "note");
                when(inventoryService.removeStock(any(RemoveStockRequestDto.class), any(UUID.class), eq(2L)))
                                .thenReturn(
                                                new InventoryResponseDto(2L, 2L, 20L, "Beer", new BigDecimal("7"),
                                                                new BigDecimal("4.00"), "abc", new BigDecimal("3.50"),
                                                                null, null, OffsetDateTime.now().toString()));

                mockMvc.perform(post("/api/inventory/remove")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(20));

                verify(inventoryService).removeStock(any(RemoveStockRequestDto.class), any(UUID.class), eq(2L));
                System.out.println("removeStock_ReturnsOk: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void adjustStock_ReturnsOk() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: adjustStock_ReturnsOk --------
                    Testitav: POST /api/inventory/adjust – kontroller kutsub adjustStock ja tagastab 200.
                    Mock: Kasutaja orgId=3. Keha: productId=30, quantity=12, notes=audit. Service tagastab productId=30, quantity=12.
                    Kontrollitakse: status 200; JSON quantity=12; verify adjustStock(..., 3L).
                    ---------------------------------------------------------------------------------""");

                User user = userWithOrg(3L, "USER");
                setAuth(user);
                AdjustStockRequestDto req = new AdjustStockRequestDto(30L, new BigDecimal("12"), "audit");
                when(inventoryService.adjustStock(any(AdjustStockRequestDto.class), any(UUID.class), eq(3L)))
                                .thenReturn(
                                                new InventoryResponseDto(3L, 3L, 30L, "Juice", new BigDecimal("12"),
                                                                new BigDecimal("2.00"), "abc", new BigDecimal("2.00"),
                                                                null, null, OffsetDateTime.now().toString()));

                mockMvc.perform(post("/api/inventory/adjust")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.quantity").value(12));

                verify(inventoryService).adjustStock(any(AdjustStockRequestDto.class), any(UUID.class), eq(3L));
                System.out.println("adjustStock_ReturnsOk: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void getTransactionHistory_ReturnsList() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getTransactionHistory_ReturnsList --------
                    Testitav: GET /api/inventory/product/40/history – kontroller kutsub getTransactionHistory(40, 4).
                    Mock: Kasutaja orgId=4. Service tagastab 1 transaktsioon (SALE, Alice).
                    Kontrollitakse: status 200; JSON massiiv size=1; verify getTransactionHistory(40, 4).
                    -----------------------------------------------------------------------------------------""");

                User user = userWithOrg(4L, "USER");
                setAuth(user);
                when(inventoryService.getTransactionHistory(40L, 4L)).thenReturn(List.of(
                                new InventoryTransactionResponseDto(1L, 99L, "SALE", BigDecimal.ONE.negate(),
                                                BigDecimal.TEN, new BigDecimal("9"), BigDecimal.TEN, BigDecimal.TEN,
                                                "ref", "n", UUID.randomUUID().toString(), "Alice", "a@b.c",
                                                OffsetDateTime.now().toString())));

                mockMvc.perform(get("/api/inventory/product/{productId}/history", 40L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getTransactionHistory(40L, 4L);
                System.out.println("getTransactionHistory_ReturnsList: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void getUserSalesStats_ReturnsList() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getUserSalesStats_ReturnsList --------
                    Testitav: GET /api/inventory/sales-stats – kontroller kutsub getUserSalesStats(6).
                    Mock: Kasutaja orgId=6. Service tagastab 1 stat (salesCount=2, totalRevenue=12.00).
                    Kontrollitakse: status 200; JSON massiiv size=1; verify getUserSalesStats(6).
                    ---------------------------------------------------------------------------------""");

                User user = userWithOrg(6L, "USER");
                setAuth(user);
                when(inventoryService.getUserSalesStats(6L)).thenReturn(List.of(
                                new UserSalesStatsResponseDto(UUID.randomUUID().toString(), "U", "u@x", 2L,
                                                new BigDecimal("12.00"), 1L, "S")));

                mockMvc.perform(get("/api/inventory/sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getUserSalesStats(6L);
                System.out.println("getUserSalesStats_ReturnsList: KÕIK KONTROLLID LÄBITUD.");
        }

        @Test
        void getStationSalesStats_ReturnsList() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: getStationSalesStats_ReturnsList --------
                    Testitav: GET /api/inventory/station-sales-stats – kontroller kutsub getStationSalesStats(7).
                    Mock: Kasutaja orgId=7. Service tagastab 1 stat (Main, salesCount=3, revenue=30.00).
                    Kontrollitakse: status 200; JSON massiiv size=1; verify getStationSalesStats(7).
                    ------------------------------------------------------------------------------------""");

                User user = userWithOrg(7L, "USER");
                setAuth(user);
                when(inventoryService.getStationSalesStats(7L)).thenReturn(List.of(
                                new StationSalesStatsResponseDto(1L, "Main", 3L, new BigDecimal("30.00"))));

                mockMvc.perform(get("/api/inventory/station-sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getStationSalesStats(7L);
                System.out.println("getStationSalesStats_ReturnsList: KÕIK KONTROLLID LÄBITUD.");
        }

        /**
         * Testib Update Price HTTP endpointi (PUT /api/inventory/product/{productId}/price).
         * <p>
         * <b>Testitav:</b> Autenditud kasutaja (org=1) saadab kehas newPrice ja notes;
         * kontroller peaks kutsuma service.updatePrice ja tagastama 200 koos vastusega.
         * <p>
         * <b>Mock andmed:</b>
         * <ul>
         *   <li>Kasutaja: orgId=1, roll USER (userWithOrg)</li>
         *   <li>Päring: PUT /api/inventory/product/10/price, body: { newPrice: 3.00, notes: "Manual" }</li>
         *   <li>Service mock tagastab: productId=10, unitPrice=3.00, productName=Cola jne</li>
         * </ul>
         * <b>Kontrollitakse:</b> Status 200; vastuse JSON sisaldab productId=10 ja unitPrice=3.00;
         * service.updatePrice kutsutakse argumentidega (10L, 3.00, "Manual", userId, 1L).
         */
        @Test
        void updatePrice_ReturnsOk() throws Exception {
                System.out.println("""
                    -------- InventoryControllerTest: updatePrice_ReturnsOk --------
                    Testitav: PUT /api/inventory/product/{productId}/price – kontroller kutsub service.updatePrice ja tagastab 200.
                    Mock andmed:
                      Kasutaja: orgId=1, roll=USER (userWithOrg), userId=random UUID
                      Päring: PUT /api/inventory/product/10/price
                      Keha: { "newPrice": 3.00, "notes": "Manual" }
                      Service mock: updatePrice(10L, 3.00, "Manual", userId, 1L) -> InventoryResponseDto(id=100, orgId=1, productId=10, productName=Cola, quantity=10, unitPrice=3.00, basePrice=2.00, minPrice=1.00, maxPrice=5.00)
                    Kontrollitakse:
                      - HTTP status 200
                      - Vastuse JSON: $.productId=10, $.unitPrice=3.00
                      - verify(inventoryService).updatePrice(eq(10L), eq(3.00), eq("Manual"), any(UUID.class), eq(1L))
                    -----------------------------------------------------------------""");

                User user = userWithOrg(1L, "USER");
                setAuth(user);

                // --- Päringu keha: uus hind 3.00, märkused "Manual" ---
                UpdatePriceRequestDto req = new UpdatePriceRequestDto(new BigDecimal("3.00"), "Manual");
                InventoryResponseDto resp = new InventoryResponseDto(
                                100L, 1L, 10L, "Cola", BigDecimal.TEN, new BigDecimal("3.00"), "abc",
                                new BigDecimal("2.00"), new BigDecimal("1.00"), new BigDecimal("5.00"),
                                OffsetDateTime.now().toString());

                when(inventoryService.updatePrice(eq(10L), eq(new BigDecimal("3.00")), eq("Manual"), any(UUID.class), eq(1L)))
                                .thenReturn(resp);

                mockMvc.perform(put("/api/inventory/product/10/price")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(10))
                                .andExpect(jsonPath("$.unitPrice").value(3.00));

                verify(inventoryService).updatePrice(eq(10L), eq(new BigDecimal("3.00")), eq("Manual"), any(UUID.class), eq(1L));

                System.out.println("updatePrice_ReturnsOk: KÕIK KONTROLLID LÄBITUD.");
        }

        private static User userWithOrg(Long orgId, String roleName) {
                Role role = Role.builder().id(1L).name(roleName).build();
                return User.builder()
                                .id(UUID.randomUUID())
                                .email("user@test.com")
                                .name("Test User")
                                .organizationId(orgId)
                                .role(role)
                                .build();
        }

        private static void setAuth(User user) {
                Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);
        }
}
