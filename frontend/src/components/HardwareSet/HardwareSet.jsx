import React from "react";
import "./HardwareSet.scss";

function HardwareSet({capacity, availability}) {
    return (
        <div className="hw-set">
            <div>
                <p>Capacity: <b>{capacity}</b></p>
                <p>Availability: <b>{availability}</b></p>
            </div>
            <input type="text" name="name" placeholder="Quantity" />
            <div className="hw-set-buttons">
                <button className="hw-set-checkin">Check in</button>
                <button className="hw-set-checkout">Check out</button>
            </div>
        </div>
    )
}

export default HardwareSet;