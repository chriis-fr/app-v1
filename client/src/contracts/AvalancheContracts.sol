pragma solidity ^0.8.30;
// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// // import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// // import "@openzeppelin/contracts/access/Ownable.sol";
// // import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// // import "@openzeppelin/contracts/utils/Counters.sol";

// /**
//  * @title AssetTokenization
//  * @dev Contract for tokenizing physical assets on Avalanche
//  */
// contract AssetTokenization is Ownable, ReentrancyGuard {
//     using Counters for Counters.Counter;
//     Counters.Counter private _assetIds;

//     struct Asset {
//         uint256 id;
//         string name;
//         string description;
//         uint256 value;
//         address owner;
//         bool isActive;
//         uint256 timestamp;
//     }

//     mapping(uint256 => Asset) public assets;
//     mapping(address => uint256[]) public userAssets;

//     event AssetCreated(uint256 indexed assetId, string name, address indexed owner);
//     event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to);
//     event AssetValueUpdated(uint256 indexed assetId, uint256 newValue);

//     function createAsset(
//         string memory _name,
//         string memory _description,
//         uint256 _value
//     ) external returns (uint256) {
//         _assetIds.increment();
//         uint256 newAssetId = _assetIds.current();

//         assets[newAssetId] = Asset({
//             id: newAssetId,
//             name: _name,
//             description: _description,
//             value: _value,
//             owner: msg.sender,
//             isActive: true,
//             timestamp: block.timestamp
//         });

//         userAssets[msg.sender].push(newAssetId);
//         emit AssetCreated(newAssetId, _name, msg.sender);
//         return newAssetId;
//     }

//     function transferAsset(uint256 _assetId, address _to) external nonReentrant {
//         require(assets[_assetId].owner == msg.sender, "Not the asset owner");
//         require(assets[_assetId].isActive, "Asset is not active");
//         require(_to != address(0), "Invalid recipient address");

//         assets[_assetId].owner = _to;
//         userAssets[_to].push(_assetId);
        
//         // Remove asset from sender's list
//         uint256[] storage senderAssets = userAssets[msg.sender];
//         for (uint256 i = 0; i < senderAssets.length; i++) {
//             if (senderAssets[i] == _assetId) {
//                 senderAssets[i] = senderAssets[senderAssets.length - 1];
//                 senderAssets.pop();
//                 break;
//             }
//         }

//         emit AssetTransferred(_assetId, msg.sender, _to);
//     }

//     function updateAssetValue(uint256 _assetId, uint256 _newValue) external {
//         require(assets[_assetId].owner == msg.sender, "Not the asset owner");
//         require(assets[_assetId].isActive, "Asset is not active");
        
//         assets[_assetId].value = _newValue;
//         emit AssetValueUpdated(_assetId, _newValue);
//     }
// }

// /**
//  * @title SupplyChainTracking
//  * @dev Contract for tracking supply chain movements on Avalanche
//  */
// contract SupplyChainTracking is Ownable, ReentrancyGuard {
//     using Counters for Counters.Counter;
//     Counters.Counter private _shipmentIds;

//     struct Shipment {
//         uint256 id;
//         string productId;
//         address sender;
//         address receiver;
//         uint256 timestamp;
//         ShipmentStatus status;
//         string location;
//     }

//     enum ShipmentStatus { Created, InTransit, Delivered, Cancelled }

//     mapping(uint256 => Shipment) public shipments;
//     mapping(address => uint256[]) public userShipments;

//     event ShipmentCreated(uint256 indexed shipmentId, string productId, address indexed sender);
//     event ShipmentStatusUpdated(uint256 indexed shipmentId, ShipmentStatus status);
//     event ShipmentLocationUpdated(uint256 indexed shipmentId, string location);

//     function createShipment(
//         string memory _productId,
//         address _receiver
//     ) external returns (uint256) {
//         _shipmentIds.increment();
//         uint256 newShipmentId = _shipmentIds.current();

//         shipments[newShipmentId] = Shipment({
//             id: newShipmentId,
//             productId: _productId,
//             sender: msg.sender,
//             receiver: _receiver,
//             timestamp: block.timestamp,
//             status: ShipmentStatus.Created,
//             location: "Origin"
//         });

//         userShipments[msg.sender].push(newShipmentId);
//         emit ShipmentCreated(newShipmentId, _productId, msg.sender);
//         return newShipmentId;
//     }

//     function updateShipmentStatus(uint256 _shipmentId, ShipmentStatus _status) external {
//         require(
//             shipments[_shipmentId].sender == msg.sender || 
//             shipments[_shipmentId].receiver == msg.sender,
//             "Not authorized"
//         );
        
//         shipments[_shipmentId].status = _status;
//         emit ShipmentStatusUpdated(_shipmentId, _status);
//     }

//     function updateShipmentLocation(uint256 _shipmentId, string memory _location) external {
//         require(
//             shipments[_shipmentId].sender == msg.sender || 
//             shipments[_shipmentId].receiver == msg.sender,
//             "Not authorized"
//         );
        
//         shipments[_shipmentId].location = _location;
//         emit ShipmentLocationUpdated(_shipmentId, _location);
//     }
// }

// /**
//  * @title EmployeeRewards
//  * @dev Contract for managing employee rewards and incentives on Avalanche
//  */
// contract EmployeeRewards is Ownable, ReentrancyGuard {
//     using Counters for Counters.Counter;
//     Counters.Counter private _rewardIds;

//     struct Reward {
//         uint256 id;
//         address employee;
//         uint256 amount;
//         string reason;
//         uint256 timestamp;
//         bool claimed;
//     }

//     IERC20 public rewardToken;
//     mapping(uint256 => Reward) public rewards;
//     mapping(address => uint256[]) public employeeRewards;

//     event RewardCreated(uint256 indexed rewardId, address indexed employee, uint256 amount);
//     event RewardClaimed(uint256 indexed rewardId, address indexed employee);

//     constructor(address _rewardToken) {
//         rewardToken = IERC20(_rewardToken);
//     }

//     function createReward(
//         address _employee,
//         uint256 _amount,
//         string memory _reason
//     ) external onlyOwner returns (uint256) {
//         require(_amount > 0, "Amount must be greater than 0");
//         require(_employee != address(0), "Invalid employee address");

//         _rewardIds.increment();
//         uint256 newRewardId = _rewardIds.current();

//         rewards[newRewardId] = Reward({
//             id: newRewardId,
//             employee: _employee,
//             amount: _amount,
//             reason: _reason,
//             timestamp: block.timestamp,
//             claimed: false
//         });

//         employeeRewards[_employee].push(newRewardId);
//         emit RewardCreated(newRewardId, _employee, _amount);
//         return newRewardId;
//     }

//     function claimReward(uint256 _rewardId) external nonReentrant {
//         Reward storage reward = rewards[_rewardId];
//         require(reward.employee == msg.sender, "Not the reward recipient");
//         require(!reward.claimed, "Reward already claimed");
//         require(rewardToken.balanceOf(address(this)) >= reward.amount, "Insufficient contract balance");

//         reward.claimed = true;
//         require(rewardToken.transfer(msg.sender, reward.amount), "Transfer failed");
//         emit RewardClaimed(_rewardId, msg.sender);
//     }
// }

// /**
//  * @title InvoiceManagement
//  * @dev Contract for managing invoices and payments on Avalanche
//  */
// contract InvoiceManagement is Ownable, ReentrancyGuard {
//     using Counters for Counters.Counter;
//     Counters.Counter private _invoiceIds;

//     struct Invoice {
//         uint256 id;
//         address issuer;
//         address client;
//         uint256 amount;
//         uint256 dueDate;
//         bool paid;
//         string description;
//     }

//     IERC20 public paymentToken;
//     mapping(uint256 => Invoice) public invoices;
//     mapping(address => uint256[]) public userInvoices;

//     event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, address indexed client);
//     event InvoicePaid(uint256 indexed invoiceId, address indexed payer);

//     constructor(address _paymentToken) {
//         paymentToken = IERC20(_paymentToken);
//     }

//     function createInvoice(
//         address _client,
//         uint256 _amount,
//         uint256 _dueDate,
//         string memory _description
//     ) external returns (uint256) {
//         require(_amount > 0, "Amount must be greater than 0");
//         require(_client != address(0), "Invalid client address");
//         require(_dueDate > block.timestamp, "Invalid due date");

//         _invoiceIds.increment();
//         uint256 newInvoiceId = _invoiceIds.current();

//         invoices[newInvoiceId] = Invoice({
//             id: newInvoiceId,
//             issuer: msg.sender,
//             client: _client,
//             amount: _amount,
//             dueDate: _dueDate,
//             paid: false,
//             description: _description
//         });

//         userInvoices[_client].push(newInvoiceId);
//         emit InvoiceCreated(newInvoiceId, msg.sender, _client);
//         return newInvoiceId;
//     }

//     function payInvoice(uint256 _invoiceId) external nonReentrant {
//         Invoice storage invoice = invoices[_invoiceId];
//         require(invoice.client == msg.sender, "Not the invoice client");
//         require(!invoice.paid, "Invoice already paid");
//         require(block.timestamp <= invoice.dueDate, "Invoice past due date");
//         require(paymentToken.balanceOf(msg.sender) >= invoice.amount, "Insufficient balance");

//         invoice.paid = true;
//         require(paymentToken.transferFrom(msg.sender, invoice.issuer, invoice.amount), "Transfer failed");
//         emit InvoicePaid(_invoiceId, msg.sender);
//     }
// } 