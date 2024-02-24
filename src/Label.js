import React, { useRef, useEffect, useState } from 'react';
import './home.css'; // 引入 CSS 文件

export default function Label() {
    const canvasRef = useRef(null);
    const [rectCoords, setRectCoords] = useState({ x: 100, y: 100, width: 200, height: 150 });
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const drawRect = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.rect(rectCoords.x, rectCoords.y, rectCoords.width, rectCoords.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 控制縮放點
            ctx.fillStyle = 'blue';
            ctx.fillRect(rectCoords.x + rectCoords.width - 5, rectCoords.y + rectCoords.height - 5, 10, 10);
        };

        drawRect();

    }, [rectCoords]);

    const handleMouseDown = (event) => {
        const { offsetX, offsetY } = event.nativeEvent;
        if (offsetX >= rectCoords.x + rectCoords.width - 5 && offsetX <= rectCoords.x + rectCoords.width + 5 &&
            offsetY >= rectCoords.y + rectCoords.height - 5 && offsetY <= rectCoords.y + rectCoords.height + 5) {
            setResizing(true);
            setStartPosition({ x: event.clientX, y: event.clientY });
        } else if (offsetX >= rectCoords.x && offsetX <= rectCoords.x + rectCoords.width &&
            offsetY >= rectCoords.y && offsetY <= rectCoords.y + rectCoords.height) {
            setDragging(true);
            setStartPosition({ x: event.clientX, y: event.clientY });
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        setResizing(false);
    };

    const handleMouseMove = (event) => {
        console.log("handleMouseMove");
        console.log(rectCoords);

        if (dragging) {
            const deltaX = event.clientX - startPosition.x;
            const deltaY = event.clientY - startPosition.y;
            setRectCoords({
                ...rectCoords,
                x: rectCoords.x + deltaX,
                y: rectCoords.y + deltaY
            });
            setStartPosition({ x: event.clientX, y: event.clientY });
        } else if (resizing) {
            console.log("resizing")
            const deltaX = event.clientX - startPosition.x;
            const deltaY = event.clientY - startPosition.y;
            const newWidth = rectCoords.width + deltaX;
            const newHeight = rectCoords.height + deltaY;

            setRectCoords({
                ...rectCoords,
                width: newWidth > 10 ? newWidth : 10,
                height: newHeight > 10 ? newHeight : 10
            });

            setStartPosition({ x: event.clientX, y: event.clientY });

        }
    };

    return (
        <div>
            <div style={{ position: 'relative' }}>
                <img
                    src="/images/1.png"
                    alt="Your Image"
                    style={{ width: '500px', height: '500px', position: 'absolute' }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    width={500}
                    height={500}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                />

                <div style={{ position: 'absolute', top: '510px', left: 0 }}>
                    <p>類別標註 {rectCoords.x}, {rectCoords.y}, {rectCoords.width}, {rectCoords.height}</p>
                </div>
            </div>

        </div>
    )
}
