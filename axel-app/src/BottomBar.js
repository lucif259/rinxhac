// BottomBar.js
import React from 'react';
import './BottomBar.css'; 

const BottomBar = ({
    onFontChange,
    onFontSizeChange,
    onBoldToggle,
    onItalicToggle,
    onTextColorChange,
    onBgColorChange,
    onAlignChange,
    onAddRow,
    onDeleteRow,
    onAddColumn,
    onDeleteColumn,
    onSaveTable 
}) => {
    return (
        <div className="bottom-bar">
            <button onClick={onAddRow} className="bottom-bar__button">Добавить строку</button>
            <button onClick={onDeleteRow} className="bottom-bar__button">Удалить строку</button>
            <button onClick={onAddColumn} className="bottom-bar__button">Добавить столбец</button>
            <button onClick={onDeleteColumn} className="bottom-bar__button">Удалить столбец</button>
            <button onClick={onSaveTable} className="bottom-bar__button">Сохранить таблицу</button> {/* Новая кнопка */}
        </div>
    );
};

export default BottomBar;
