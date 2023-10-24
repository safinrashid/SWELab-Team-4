import React from "react";
import "./HardwareSet.scss";

function HardwareSet({name, capacity, availability}) {

    if (name == null && capacity == null && availability == null) return <></>;

    return (
        <div className="hw-set">
            <div>
                <p>Name: <b>{name}</b></p>
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