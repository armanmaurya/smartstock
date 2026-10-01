package com.armanmaurya.inventory.service;

import com.armanmaurya.inventory.dto.ProductDTO;
import com.armanmaurya.inventory.entity.Product;
import com.armanmaurya.inventory.exception.BusinessException;
import com.armanmaurya.inventory.exception.ResourceNotFoundException;
import com.armanmaurya.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    @Transactional(readOnly = true)
    public Product getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode));
    }

    @Transactional(readOnly = true)
    public Product getProductByRfid(String rfid) {
        return productRepository.findByRfidTag(rfid)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with RFID: " + rfid));
    }

    @Transactional(readOnly = true)
    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.searchProducts(query.trim());
    }

    public Product createProduct(ProductDTO dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with SKU '" + dto.getSku() + "' already exists.");
        }
        if (productRepository.existsByBarcode(dto.getBarcode())) {
            throw new BusinessException("Product with Barcode '" + dto.getBarcode() + "' already exists.");
        }
        if (dto.getRfidTag() != null && !dto.getRfidTag().isBlank() && productRepository.existsByRfidTag(dto.getRfidTag())) {
            throw new BusinessException("Product with RFID Tag '" + dto.getRfidTag() + "' already exists.");
        }

        Product product = new Product(
                dto.getSku(),
                dto.getName(),
                dto.getCategory(),
                dto.getBrand(),
                dto.getCostPrice(),
                dto.getSellingPrice(),
                dto.getBarcode(),
                dto.getRfidTag(),
                dto.getUnitOfMeasure()
        );
        product.setDescription(dto.getDescription());
        product.setActive(dto.isActive());

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductDTO dto) {
        Product existing = getProductById(id);

        if (!existing.getSku().equalsIgnoreCase(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with SKU '" + dto.getSku() + "' already exists.");
        }
        if (!existing.getBarcode().equalsIgnoreCase(dto.getBarcode()) && productRepository.existsByBarcode(dto.getBarcode())) {
            throw new BusinessException("Product with Barcode '" + dto.getBarcode() + "' already exists.");
        }
        if (dto.getRfidTag() != null && !dto.getRfidTag().equalsIgnoreCase(existing.getRfidTag()) && productRepository.existsByRfidTag(dto.getRfidTag())) {
            throw new BusinessException("Product with RFID Tag '" + dto.getRfidTag() + "' already exists.");
        }

        existing.setSku(dto.getSku());
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setCategory(dto.getCategory());
        existing.setBrand(dto.getBrand());
        existing.setCostPrice(dto.getCostPrice());
        existing.setSellingPrice(dto.getSellingPrice());
        existing.setBarcode(dto.getBarcode());
        existing.setRfidTag(dto.getRfidTag());
        existing.setUnitOfMeasure(dto.getUnitOfMeasure());
        existing.setActive(dto.isActive());

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
}
