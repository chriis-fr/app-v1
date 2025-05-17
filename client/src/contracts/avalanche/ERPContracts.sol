// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ERPToken
 * @dev Main token contract for the ERP system
 */
contract ERPToken is Ownable, Pausable {
    string public name = "ERP System Token";
    string public symbol = "ERP";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external whenNotPaused returns (bool) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Invalid address");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external whenNotPaused returns (bool) {
        require(from != address(0) && to != address(0), "Invalid address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

/**
 * @title AssetManagement
 * @dev Contract for managing physical and digital assets
 */
contract AssetManagement is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _assetIds;
    
    struct Asset {
        uint256 id;
        string name;
        string description;
        uint256 value;
        address owner;
        AssetType assetType;
        bool isActive;
        uint256 timestamp;
        string metadata;
    }
    
    enum AssetType { Physical, Digital, Financial, Intellectual }
    
    mapping(uint256 => Asset) public assets;
    mapping(address => uint256[]) public userAssets;
    mapping(string => uint256) public assetByName;
    
    event AssetCreated(uint256 indexed assetId, string name, address indexed owner);
    event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to);
    event AssetValueUpdated(uint256 indexed assetId, uint256 newValue);
    event AssetMetadataUpdated(uint256 indexed assetId, string metadata);
    
    function createAsset(
        string memory _name,
        string memory _description,
        uint256 _value,
        AssetType _assetType,
        string memory _metadata
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(assetByName[_name] == 0, "Asset name already exists");
        
        _assetIds.increment();
        uint256 newAssetId = _assetIds.current();
        
        assets[newAssetId] = Asset({
            id: newAssetId,
            name: _name,
            description: _description,
            value: _value,
            owner: msg.sender,
            assetType: _assetType,
            isActive: true,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        assetByName[_name] = newAssetId;
        userAssets[msg.sender].push(newAssetId);
        emit AssetCreated(newAssetId, _name, msg.sender);
        return newAssetId;
    }
    
    function transferAsset(uint256 _assetId, address _to) external nonReentrant {
        require(assets[_assetId].owner == msg.sender, "Not the asset owner");
        require(assets[_assetId].isActive, "Asset is not active");
        require(_to != address(0), "Invalid recipient address");
        
        assets[_assetId].owner = _to;
        userAssets[_to].push(_assetId);
        
        // Remove asset from sender's list
        uint256[] storage senderAssets = userAssets[msg.sender];
        for (uint256 i = 0; i < senderAssets.length; i++) {
            if (senderAssets[i] == _assetId) {
                senderAssets[i] = senderAssets[senderAssets.length - 1];
                senderAssets.pop();
                break;
            }
        }
        
        emit AssetTransferred(_assetId, msg.sender, _to);
    }
    
    function updateAssetMetadata(uint256 _assetId, string memory _metadata) external {
        require(assets[_assetId].owner == msg.sender, "Not the asset owner");
        require(assets[_assetId].isActive, "Asset is not active");
        
        assets[_assetId].metadata = _metadata;
        emit AssetMetadataUpdated(_assetId, _metadata);
    }
}

/**
 * @title SupplyChain
 * @dev Contract for managing supply chain operations
 */
contract SupplyChain is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _shipmentIds;
    
    struct Shipment {
        uint256 id;
        string productId;
        address sender;
        address receiver;
        uint256 timestamp;
        ShipmentStatus status;
        string location;
        string trackingNumber;
        uint256 estimatedDelivery;
        string[] milestones;
    }
    
    enum ShipmentStatus { Created, InTransit, Delivered, Cancelled, Delayed }
    
    mapping(uint256 => Shipment) public shipments;
    mapping(address => uint256[]) public userShipments;
    mapping(string => uint256) public shipmentByTracking;
    
    event ShipmentCreated(uint256 indexed shipmentId, string productId, address indexed sender);
    event ShipmentStatusUpdated(uint256 indexed shipmentId, ShipmentStatus status);
    event ShipmentLocationUpdated(uint256 indexed shipmentId, string location);
    event MilestoneAdded(uint256 indexed shipmentId, string milestone);
    
    function createShipment(
        string memory _productId,
        address _receiver,
        string memory _trackingNumber,
        uint256 _estimatedDelivery
    ) external returns (uint256) {
        require(_receiver != address(0), "Invalid receiver address");
        require(bytes(_trackingNumber).length > 0, "Tracking number required");
        require(shipmentByTracking[_trackingNumber] == 0, "Tracking number already exists");
        
        _shipmentIds.increment();
        uint256 newShipmentId = _shipmentIds.current();
        
        string[] memory initialMilestones = new string[](0);
        
        shipments[newShipmentId] = Shipment({
            id: newShipmentId,
            productId: _productId,
            sender: msg.sender,
            receiver: _receiver,
            timestamp: block.timestamp,
            status: ShipmentStatus.Created,
            location: "Origin",
            trackingNumber: _trackingNumber,
            estimatedDelivery: _estimatedDelivery,
            milestones: initialMilestones
        });
        
        shipmentByTracking[_trackingNumber] = newShipmentId;
        userShipments[msg.sender].push(newShipmentId);
        emit ShipmentCreated(newShipmentId, _productId, msg.sender);
        return newShipmentId;
    }
    
    function addMilestone(uint256 _shipmentId, string memory _milestone) external {
        require(
            shipments[_shipmentId].sender == msg.sender || 
            shipments[_shipmentId].receiver == msg.sender,
            "Not authorized"
        );
        
        shipments[_shipmentId].milestones.push(_milestone);
        emit MilestoneAdded(_shipmentId, _milestone);
    }
}

/**
 * @title EmployeeManagement
 * @dev Contract for managing employee-related operations
 */
contract EmployeeManagement is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _employeeIds;
    
    struct Employee {
        uint256 id;
        address wallet;
        string name;
        string role;
        uint256 salary;
        uint256 joinDate;
        bool isActive;
        string[] skills;
        uint256[] completedTrainings;
    }
    
    struct Training {
        uint256 id;
        string name;
        string description;
        uint256 duration;
        uint256 cost;
        bool isActive;
    }
    
    mapping(uint256 => Employee) public employees;
    mapping(address => uint256) public employeeByWallet;
    mapping(uint256 => Training) public trainings;
    mapping(uint256 => mapping(uint256 => bool)) public employeeTrainingStatus;
    
    event EmployeeAdded(uint256 indexed employeeId, address indexed wallet, string name);
    event EmployeeUpdated(uint256 indexed employeeId, string role, uint256 salary);
    event TrainingCompleted(uint256 indexed employeeId, uint256 indexed trainingId);
    
    function addEmployee(
        address _wallet,
        string memory _name,
        string memory _role,
        uint256 _salary
    ) external onlyOwner returns (uint256) {
        require(_wallet != address(0), "Invalid wallet address");
        require(employeeByWallet[_wallet] == 0, "Employee already exists");
        
        _employeeIds.increment();
        uint256 newEmployeeId = _employeeIds.current();
        
        string[] memory initialSkills = new string[](0);
        uint256[] memory initialTrainings = new uint256[](0);
        
        employees[newEmployeeId] = Employee({
            id: newEmployeeId,
            wallet: _wallet,
            name: _name,
            role: _role,
            salary: _salary,
            joinDate: block.timestamp,
            isActive: true,
            skills: initialSkills,
            completedTrainings: initialTrainings
        });
        
        employeeByWallet[_wallet] = newEmployeeId;
        emit EmployeeAdded(newEmployeeId, _wallet, _name);
        return newEmployeeId;
    }
    
    function addTraining(
        string memory _name,
        string memory _description,
        uint256 _duration,
        uint256 _cost
    ) external onlyOwner returns (uint256) {
        uint256 trainingId = block.timestamp;
        trainings[trainingId] = Training({
            id: trainingId,
            name: _name,
            description: _description,
            duration: _duration,
            cost: _cost,
            isActive: true
        });
        return trainingId;
    }
    
    function completeTraining(uint256 _employeeId, uint256 _trainingId) external {
        require(employees[_employeeId].isActive, "Employee not active");
        require(trainings[_trainingId].isActive, "Training not active");
        require(!employeeTrainingStatus[_employeeId][_trainingId], "Training already completed");
        
        employeeTrainingStatus[_employeeId][_trainingId] = true;
        employees[_employeeId].completedTrainings.push(_trainingId);
        emit TrainingCompleted(_employeeId, _trainingId);
    }
}

/**
 * @title InvoiceSystem
 * @dev Contract for managing invoices and payments
 */
contract InvoiceSystem is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _invoiceIds;
    
    struct Invoice {
        uint256 id;
        address issuer;
        address client;
        uint256 amount;
        uint256 dueDate;
        bool paid;
        string description;
        string[] lineItems;
        uint256[] quantities;
        uint256[] prices;
    }
    
    IERC20 public paymentToken;
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public userInvoices;
    mapping(string => uint256) public invoiceByReference;
    
    event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, address indexed client);
    event InvoicePaid(uint256 indexed invoiceId, address indexed payer);
    event LineItemAdded(uint256 indexed invoiceId, string item, uint256 quantity, uint256 price);
    
    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }
    
    function createInvoice(
        address _client,
        uint256 _amount,
        uint256 _dueDate,
        string memory _description,
        string memory _reference
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_client != address(0), "Invalid client address");
        require(_dueDate > block.timestamp, "Invalid due date");
        require(invoiceByReference[_reference] == 0, "Reference already exists");
        
        _invoiceIds.increment();
        uint256 newInvoiceId = _invoiceIds.current();
        
        string[] memory initialItems = new string[](0);
        uint256[] memory initialQuantities = new uint256[](0);
        uint256[] memory initialPrices = new uint256[](0);
        
        invoices[newInvoiceId] = Invoice({
            id: newInvoiceId,
            issuer: msg.sender,
            client: _client,
            amount: _amount,
            dueDate: _dueDate,
            paid: false,
            description: _description,
            lineItems: initialItems,
            quantities: initialQuantities,
            prices: initialPrices
        });
        
        invoiceByReference[_reference] = newInvoiceId;
        userInvoices[_client].push(newInvoiceId);
        emit InvoiceCreated(newInvoiceId, msg.sender, _client);
        return newInvoiceId;
    }
    
    function addLineItem(
        uint256 _invoiceId,
        string memory _item,
        uint256 _quantity,
        uint256 _price
    ) external {
        require(invoices[_invoiceId].issuer == msg.sender, "Not the invoice issuer");
        require(!invoices[_invoiceId].paid, "Invoice already paid");
        
        invoices[_invoiceId].lineItems.push(_item);
        invoices[_invoiceId].quantities.push(_quantity);
        invoices[_invoiceId].prices.push(_price);
        
        emit LineItemAdded(_invoiceId, _item, _quantity, _price);
    }
    
    function payInvoice(uint256 _invoiceId) external nonReentrant {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.client == msg.sender, "Not the invoice client");
        require(!invoice.paid, "Invoice already paid");
        require(block.timestamp <= invoice.dueDate, "Invoice past due date");
        require(paymentToken.balanceOf(msg.sender) >= invoice.amount, "Insufficient balance");
        
        invoice.paid = true;
        require(paymentToken.transferFrom(msg.sender, invoice.issuer, invoice.amount), "Transfer failed");
        emit InvoicePaid(_invoiceId, msg.sender);
    }
} 