// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  SupplyChain
 * @notice Blockchain Audit & Transparency Layer for MSME Supply Chain
 * @dev    Records immutable supply chain events: Dispatch, Delivery,
 *         InventoryUpdate, DelayEvent, ReorderAction
 */
contract SupplyChain {

    // ── Access control ──────────────────────────────────────────────────────
    address public owner;
    mapping(address => bool) public authorizedActors;

    modifier onlyOwner() {
        require(msg.sender == owner, "SupplyChain: caller is not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedActors[msg.sender] || msg.sender == owner, "SupplyChain: not authorized");
        _;
    }

    // ── Enumerations ────────────────────────────────────────────────────────
    enum EventType { Dispatch, Delivery, InventoryUpdate, DelayEvent, ReorderAction }
    enum ShipmentStatus { Created, InTransit, Delayed, Delivered, Cancelled }

    // ── Structs ─────────────────────────────────────────────────────────────
    struct SupplyChainEvent {
        uint256 id;
        EventType eventType;
        string  shipmentId;
        string  sku;
        address actor;
        uint256 timestamp;
        string  metadata;      // JSON-encoded extra fields
        bool    verified;
    }

    struct Shipment {
        string        shipmentId;
        string        origin;
        string        destination;
        string        cargo;
        address       carrier;
        uint256       dispatchTime;
        uint256       expectedETA;
        uint256       actualDelivery;
        ShipmentStatus status;
        uint256[]     eventIds;
    }

    struct InventoryRecord {
        string  sku;
        string  productName;
        uint256 quantity;
        uint256 reorderPoint;
        uint256 safetyStock;
        uint256 lastUpdated;
        address updatedBy;
    }

    // ── State ────────────────────────────────────────────────────────────────
    uint256 private _eventCounter;

    mapping(uint256 => SupplyChainEvent) public events;
    mapping(string  => Shipment)         public shipments;
    mapping(string  => InventoryRecord)  public inventory;

    uint256[] public allEventIds;

    // ── Events (blockchain logs) ─────────────────────────────────────────────
    event EventLogged(
        uint256 indexed eventId,
        EventType indexed eventType,
        string shipmentId,
        string sku,
        address indexed actor,
        uint256 timestamp
    );

    event ActorAuthorized(address actor, bool status);
    event ShipmentCreated(string shipmentId, string origin, string destination);
    event ShipmentStatusUpdated(string shipmentId, ShipmentStatus status);
    event InventoryUpdated(string sku, uint256 newQuantity, uint256 reorderPoint);
    event ReorderTriggered(string sku, uint256 currentQty, uint256 ropQty);

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        authorizedActors[msg.sender] = true;
    }

    // ── Access management ────────────────────────────────────────────────────
    function setActorAuthorization(address actor, bool authorized) external onlyOwner {
        authorizedActors[actor] = authorized;
        emit ActorAuthorized(actor, authorized);
    }

    // ── Internal log helper ──────────────────────────────────────────────────
    function _logEvent(
        EventType  etype,
        string memory shipId,
        string memory sku,
        string memory metadata
    ) internal returns (uint256) {
        _eventCounter++;
        uint256 id = _eventCounter;

        events[id] = SupplyChainEvent({
            id:        id,
            eventType: etype,
            shipmentId: shipId,
            sku:       sku,
            actor:     msg.sender,
            timestamp: block.timestamp,
            metadata:  metadata,
            verified:  true
        });

        allEventIds.push(id);

        emit EventLogged(id, etype, shipId, sku, msg.sender, block.timestamp);
        return id;
    }

    function logSupplyChainEvent(
        EventType  etype,
        string memory shipId,
        string memory sku,
        string memory metadata
    ) external onlyAuthorized returns (uint256) {
        return _logEvent(etype, shipId, sku, metadata);
    }

    // ── Shipment lifecycle ───────────────────────────────────────────────────
    function createShipment(
        string calldata shipmentId,
        string calldata origin,
        string calldata destination,
        string calldata cargo,
        uint256 expectedETA
    ) external onlyAuthorized {
        require(bytes(shipments[shipmentId].shipmentId).length == 0, "Shipment already exists");

        Shipment storage s = shipments[shipmentId];
        s.shipmentId    = shipmentId;
        s.origin        = origin;
        s.destination   = destination;
        s.cargo         = cargo;
        s.carrier       = msg.sender;
        s.dispatchTime  = block.timestamp;
        s.expectedETA   = expectedETA;
        s.status        = ShipmentStatus.Created;

        uint256 eid = _logEvent(EventType.Dispatch, shipmentId, "", '{"action":"created"}');
        s.eventIds.push(eid);

        emit ShipmentCreated(shipmentId, origin, destination);
    }

    function markInTransit(string calldata shipmentId) external onlyAuthorized {
        Shipment storage s = shipments[shipmentId];
        require(s.status == ShipmentStatus.Created, "Invalid status transition");
        s.status = ShipmentStatus.InTransit;

        uint256 eid = _logEvent(EventType.Dispatch, shipmentId, "", '{"action":"in_transit"}');
        s.eventIds.push(eid);

        emit ShipmentStatusUpdated(shipmentId, ShipmentStatus.InTransit);
    }

    function recordDelay(
        string calldata shipmentId,
        uint256 delayHours,
        string calldata reason
    ) external onlyAuthorized {
        Shipment storage s = shipments[shipmentId];
        s.status = ShipmentStatus.Delayed;
        s.expectedETA += delayHours * 3600;

        string memory meta = string(abi.encodePacked('{"delay_hours":', _uint2str(delayHours), ',"reason":"', reason, '"}'));
        uint256 eid = _logEvent(EventType.DelayEvent, shipmentId, "", meta);
        s.eventIds.push(eid);

        emit ShipmentStatusUpdated(shipmentId, ShipmentStatus.Delayed);
    }

    function confirmDelivery(string calldata shipmentId) external onlyAuthorized {
        Shipment storage s = shipments[shipmentId];
        require(
            s.status == ShipmentStatus.InTransit || s.status == ShipmentStatus.Delayed,
            "Cannot deliver from current status"
        );
        s.status          = ShipmentStatus.Delivered;
        s.actualDelivery  = block.timestamp;

        uint256 eid = _logEvent(EventType.Delivery, shipmentId, "", '{"action":"delivered"}');
        s.eventIds.push(eid);

        emit ShipmentStatusUpdated(shipmentId, ShipmentStatus.Delivered);
    }

    // ── Inventory ─────────────────────────────────────────────────────────────
    function updateInventory(
        string calldata sku,
        string calldata productName,
        uint256 quantity,
        uint256 reorderPoint,
        uint256 safetyStock
    ) external onlyAuthorized {
        inventory[sku] = InventoryRecord({
            sku:          sku,
            productName:  productName,
            quantity:     quantity,
            reorderPoint: reorderPoint,
            safetyStock:  safetyStock,
            lastUpdated:  block.timestamp,
            updatedBy:    msg.sender
        });

        _logEvent(EventType.InventoryUpdate, "", sku,
            string(abi.encodePacked('{"qty":', _uint2str(quantity), ',"rop":', _uint2str(reorderPoint), '}'))
        );

        emit InventoryUpdated(sku, quantity, reorderPoint);

        // Auto-trigger reorder event if below ROP
        if (quantity <= reorderPoint) {
            _logEvent(EventType.ReorderAction, "", sku,
                string(abi.encodePacked('{"trigger":"auto","qty":', _uint2str(quantity), ',"rop":', _uint2str(reorderPoint), '}'))
            );
            emit ReorderTriggered(sku, quantity, reorderPoint);
        }
    }

    // ── Query helpers ─────────────────────────────────────────────────────────
    function getTotalEvents() external view returns (uint256) {
        return _eventCounter;
    }

    function getShipmentEvents(string calldata shipmentId) external view returns (uint256[] memory) {
        return shipments[shipmentId].eventIds;
    }

    function getRecentEvents(uint256 count) external view returns (SupplyChainEvent[] memory) {
        uint256 total = allEventIds.length;
        uint256 n     = count > total ? total : count;
        SupplyChainEvent[] memory result = new SupplyChainEvent[](n);
        for (uint256 i = 0; i < n; i++) {
            result[i] = events[allEventIds[total - n + i]];
        }
        return result;
    }

    // ── Utilities ─────────────────────────────────────────────────────────────
    function _uint2str(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 tmp = v; uint256 digits;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) { digits--; buf[digits] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }
}
