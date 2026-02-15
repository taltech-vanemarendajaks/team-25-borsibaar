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
                User user = userWithOrg(42L, "USER");
                setAuth(user);

                when(inventoryService.getByOrganization(42L, null)).thenReturn(List.of());
                mockMvc.perform(get("/api/inventory"))
                                .andExpect(status().isOk());

                verify(inventoryService).getByOrganization(42L, null);
        }

        @Test
        void addStock_ReturnsCreated() throws Exception {
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
        }

        @Test
        void getOrganizationInventory_UsesQueryParams_WhenProvided() throws Exception {
                when(inventoryService.getByOrganization(99L, 7L)).thenReturn(List.of(
                                new InventoryResponseDto(1L, 99L, 10L, "Cola", BigDecimal.ONE, BigDecimal.TEN, "abc",
                                                BigDecimal.TEN, null, null, OffsetDateTime.now().toString())));

                mockMvc.perform(get("/api/inventory").param("organizationId", "99").param("categoryId", "7"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].organizationId").value(99));

                verify(inventoryService).getByOrganization(99L, 7L);
        }

        @Test
        void getProductInventory_DelegatesToService() throws Exception {
                User user = userWithOrg(5L, "USER");
                setAuth(user);
                when(inventoryService.getByProductAndOrganization(10L, 5L)).thenReturn(
                                new InventoryResponseDto(1L, 5L, 10L, "Water", BigDecimal.TEN, BigDecimal.ONE, "abc",
                                                BigDecimal.ONE, null, null, OffsetDateTime.now().toString()));

                mockMvc.perform(get("/api/inventory/product/{productId}", 10L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(10));

                verify(inventoryService).getByProductAndOrganization(10L, 5L);
        }

        @Test
        void removeStock_ReturnsOk() throws Exception {
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
        }

        @Test
        void adjustStock_ReturnsOk() throws Exception {
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
        }

        @Test
        void getTransactionHistory_ReturnsList() throws Exception {
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
        }

        @Test
        void getUserSalesStats_ReturnsList() throws Exception {
                User user = userWithOrg(6L, "USER");
                setAuth(user);
                when(inventoryService.getUserSalesStats(6L)).thenReturn(List.of(
                                new UserSalesStatsResponseDto(UUID.randomUUID().toString(), "U", "u@x", 2L,
                                                new BigDecimal("12.00"), 1L, "S")));

                mockMvc.perform(get("/api/inventory/sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getUserSalesStats(6L);
        }

        @Test
        void getStationSalesStats_ReturnsList() throws Exception {
                User user = userWithOrg(7L, "USER");
                setAuth(user);
                when(inventoryService.getStationSalesStats(7L)).thenReturn(List.of(
                                new StationSalesStatsResponseDto(1L, "Main", 3L, new BigDecimal("30.00"))));

                mockMvc.perform(get("/api/inventory/station-sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getStationSalesStats(7L);
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
