import React, { useState, useEffect } from 'react'
import "../cssFiles/task.css";

export default function Tasks(props) {
    const [taskdata, setTaskData] = useState("");
    const [allTask, setAllTasks] = useState([]);

    useEffect(() => {
        reloadTasks();
    }, [props.currentCategory])

    const reloadTasks = () => {
        fetch('http://localhost:3001/gettasks', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "category": props.currentCategory })
        })
            .then((res) => res.json())
            .then((data) => {
                setAllTasks(data.tasksData)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const addTask = () => {
        fetch('http://localhost:3001/addtasks', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "task": taskdata, "category": props.currentCategory })
        })
            .then((res) => res.json())
            .then(() => {
                setTaskData("");
                reloadTasks();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const handleEvent = (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    }

    const changeState = (taskId) => {
        fetch('http://localhost:3001/completeState', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "taskId": taskId })
        })
            .then((res) => res.json())
            .then(() => {
                reloadTasks();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const deleteTask = (taskId) => {
        fetch('http://localhost:3001/deletetask', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "taskId": taskId, "category": props.currentCategory })
        })
            .then((res) => res.json())
            .then(() => {
                reloadTasks();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div id="task_component">
            <div id="task_input_area">
                <input type="text" name="task"
                    value={taskdata}
                    onKeyDown={handleEvent}
                    onChange={(e) => { setTaskData(e.target.value) }}
                    id="task_input" placeholder='Enter your task ...' />
            </div>
            <div id="task_area">
                {
                    allTask.length === 0 ?
                        <div id="no_task"><p>Currently No task in this category ...</p></div>
                        :
                        allTask.map((item) => (
                            item.isCompleted
                                ? <div key={item._id} id="task_area_tasks">
                                    <i class="fa-solid fa-circle" id="isCompletedIcon1" onClick={() => { changeState(item._id) }}></i>
                                    <div style={{ textDecoration: "line-through", marginLeft: "10px", width: "calc(100% - 73px)" }}>{item.task}</div>
                                    <i class="fa-solid fa-trash" id="delete_icon" onClick={() => { deleteTask(item._id) }}></i>
                                </div>
                                : <div key={item._id} id="task_area_tasks">
                                    <i class="fa-regular fa-circle" id="isCompletedIcon2" onClick={() => { changeState(item._id) }}></i>
                                    <div style={{ marginLeft: "10px", width: "calc(100% - 73px)" }}>{item.task}</div>
                                    <i class="fa-solid fa-trash" id="delete_icon" onClick={() => { deleteTask(item._id) }}></i>
                                </div>
                        ))
                }
            </div>
        </div>
    )
}
