import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { checkInHWSet, checkOutHWSet } from "../../api";
import "./HardwareSet.scss";

function HardwareSet({hwID, name, capacity, availability}) {    
    const { id } = useParams();
    const [availabilityState, setAvailabilityState] = useState(availability);
    const [cookies, setCookie] = useCookies(['userID']);
    
    var checkInHardware = () => {
        var qty = parseInt(document.getElementById(`quantity-input-${name}`).value);
        try{
            checkInHWSet(cookies.userID, id, hwID, qty);
            if ((availabilityState + qty <= capacity)  && qty >= 0){
                setAvailabilityState(availabilityState + qty);
            }
        }catch(error){
            console.log("Error checking in hardware set: " + error);
        }
    }

    var checkOutHardware = () => {
        var qty = parseInt(document.getElementById(`quantity-input-${name}`).value);
        try{
            checkOutHWSet(cookies.userID, id, hwID, qty);
            if ((availabilityState - qty >= 0) && qty >= 0){
                setAvailabilityState(availabilityState - qty);
            }
        }catch(error){
            console.log("Error checking out hardware set: " + error);
        }
    }

    if (name == null && capacity == null && availability == null) return <></>;

    return (
        <div className="hw-set">
            <div>
                <p>Name: <b>{name}</b></p>
                <p>Capacity: <b>{capacity}</b></p>
                <p>Availability: <b>{availabilityState}</b></p>
            </div>
            <input id={`quantity-input-${name}`} type="text" name="quantity" placeholder="Quantity" />
            <div className="hw-set-buttons">
                <button className="hw-set-checkin" onClick={() => checkInHardware()}>Check in</button>
                <button className="hw-set-checkout" onClick={() => checkOutHardware()}>Check out</button>
            </div>
        </div>
    )
}

export default HardwareSet;