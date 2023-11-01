import React from "react";
import { useParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { checkInHWSet, checkOutHWSet } from "../../api";
import "./HardwareSet.scss";

function HardwareSet({hwID, name, capacity, availability}) {    
    const { id } = useParams();
    const [cookies, setCookie] = useCookies(['userID']);
    
    var checkInHardware = (qty) => {
        var qty = parseInt(document.getElementById("quantity-input").value);

        checkInHWSet(cookies.userID, id, hwID, qty);
    }

    var checkOutHardware = () => {
        var qty = parseInt(document.getElementById("quantity-input").value);

        checkOutHWSet(cookies.userID, id, hwID, qty);
    }

    if (name == null && capacity == null && availability == null) return <></>;

    return (
        <div className="hw-set">
            <div>
                <p>Name: <b>{name}</b></p>
                <p>Capacity: <b>{capacity}</b></p>
                <p>Availability: <b>{availability}</b></p>
            </div>
            <input id="quantity-input" type="text" name="quantity" placeholder="Quantity" />
            <div className="hw-set-buttons">
                <button className="hw-set-checkin" onClick={() => checkInHardware()}>Check in</button>
                <button className="hw-set-checkout" onClick={() => checkOutHardware()}>Check out</button>
            </div>
        </div>
    )
}

export default HardwareSet;