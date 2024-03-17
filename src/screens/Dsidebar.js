import React, { useEffect, useState } from 'react'
import "../cssFiles/sidebar.css"
import todo_icon from '../todo_icon.png';
import { useNavigate } from 'react-router-dom';

export default function Dsidebar() {
    const [newCategory, setNewCategory] = useState("");
    const [isError, setIsError] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

    const handleEvent = (e) => {
        if (e.key === "Enter") {
            addCategories();
        }
    }

    const showErrorStyle = () => {
        if (document.querySelector("#empty_box_message")) {
            document.querySelector("#empty_box_message").style.visibility = "visible";
            document.querySelector("#empty_box_message").style.color = "red";
        }
    };

    const showSuccessStyle = () => {
        if (document.querySelector("#empty_box_message")) {
            document.querySelector("#empty_box_message").style.visibility = "visible";
            document.querySelector("#empty_box_message").style.color = "green";
        }
    };

    const hideMessage = () => {
        if (document.querySelector("#empty_box_message")) {
            document.querySelector("#empty_box_message").style.visibility = "hidden";
        }
    };

    const addCategories = () => {
        if (newCategory.trim() === "") {
            setIsError(true);
            setShowAlert(true);
            showErrorStyle();
            setTimeout(hideMessage, 2000);
        }
        else {
            setNewCategory("");
            fetch('http://localhost:3001/addcategories', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category: newCategory })
            })
                .then((res) => res.json()) // Parse the JSON response
                .then((data) => {
                    setShowAlert(true);
                    setIsError(false);
                    showSuccessStyle();
                    setTimeout(hideMessage, 2000);
                    navigate("/" + newCategory);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    return (
        <div id="sidebar">
            <div id="todo_title">
                <img src={todo_icon} id="style_icon" ></img>
                <div id="style_title">Let's Do</div>
            </div>
            <hr style={{ width: "100%" }} />
            <div id="add_category">
                <input
                    type="text"
                    id="input_categories"
                    placeholder="Enter new category"
                    value={newCategory}
                    onChange={(e) => { setNewCategory(e.target.value) }}
                    onKeyDown={handleEvent} />

                <i className="fa-solid fa-plus" id="add_icon1" onClick={addCategories} />
            </div>
            {
                showAlert && <div id="empty_box_message">
                    {
                        isError
                            ? "Category can't be empty"
                            : "Category successfully added"
                    }
                </div>
            }
            <div id="show_categories1">
                <div id="no_category"><u>Currently no category</u> ...</div>
            </div>

        </div>
    )
}
