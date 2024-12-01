import React, { useRef, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import BottomBar from './BottomBar'; 
import ErrorBoundary from './ErrorBoundary'; 
import axios from 'axios'; 
import './App.css';

registerAllModules();

const MyTable = () => {
    const hotRef = useRef(null);
    const [tables, setTables] = useState([{ id: 1, name: 'Таблица 1', data: initialData() }]);
    const [activeTableId, setActiveTableId] = useState(1);
    const [data, setData] = useState(initialData());
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(12);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [textColor, setTextColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [alignment, setAlignment] = useState('');
    const [formulas, setFormulas] = useState({});

    function initialData() {
        return Array.from({ length: 100 }, (_, rowIndex) => {
            return Array.from({ length: 100 }, (_, colIndex) => {
                return rowIndex === 0 ? `Столбец ${colIndex + 1}` : ''; 
            });
        });
    }
    
    const switchTable = (id) => {
        setActiveTableId(id);
    };

    const addTable = () => {
        const newId = tables.length + 1;
        setTables([...tables, { id: newId, name: `Таблица ${newId}`, data: initialData() }]);
        setActiveTableId(newId);
    };

    const deleteTable = (id) => {
        if (tables.length > 1) {
            setTables(tables.filter(table => table.id !== id));
            if (activeTableId === id) {
                setActiveTableId(tables[0].id);
            }
        }
    };

    const updateCellStyles = () => {
        if (hotRef.current) {
            const selected = hotRef.current.hotInstance.getSelected();
            if (selected && selected.length > 0) {
                selected.forEach(([row, col]) => {
                    if (Number.isInteger(row) && Number.isInteger(col) && row >= 0 && col >= 0) {
                        hotRef.current.hotInstance.setCellMeta(row, col, 'style', {
                            fontFamily,
                            fontSize: `${fontSize}px`,
                            fontWeight: isBold ? 'bold' : 'normal',
                            fontStyle: isItalic ? 'italic' : 'normal',
                            color: textColor,
                            backgroundColor: bgColor,
                            textAlign: alignment,
                        });
                        hotRef.current.hotInstance.render();
                    }
                });
            }
        }
    };

    const handleFontChange = (font) => {
        setFontFamily(font);
        updateCellStyles();
    };

    const handleFontSizeChange = (size) => {
        setFontSize(Number(size));
        updateCellStyles();
    };

    const toggleBold = () => {
        setIsBold((prev) => !prev);
        updateCellStyles();
    };

    const toggleItalic = () => {
        setIsItalic((prev) => !prev);
        updateCellStyles();
    };

    const handleTextColorChange = (color) => {
        setTextColor(color);
        updateCellStyles();
    };

    const handleBgColorChange = (color) => {
        setBgColor(color);
        updateCellStyles();
    };

    const handleAlignChange = (align) => {
        setAlignment(align);
        updateCellStyles();
    };

    const addRow = () => {
        setTables((prevTables) =>
            prevTables.map((table) =>
                table.id === activeTableId
                    ? { ...table, data: [...table.data, Array(table.data[0].length).fill('')] }
                    : table
            )
        );
    };

    const deleteRow = () => {
        if (hotRef.current) {
            const selected = hotRef.current.hotInstance.getSelected();
            if (selected && selected.length > 0) {
                const rowsToDelete = selected.map(([row]) => row);
                const uniqueRows = [...new Set(rowsToDelete)].sort((a, b) => b - a);
    
                setTables((prevTables) =>
                    prevTables.map((table) =>
                        table.id === activeTableId
                            ? {
                                  ...table,
                                  data: table.data.filter((_, index) => !uniqueRows.includes(index)),
                              }
                            : table
                    )
                );
            }
        }
    };

    const addColumn = () => {
        setTables((prevTables) =>
            prevTables.map((table) =>
                table.id === activeTableId
                    ? {
                          ...table,
                          data: table.data.map((row) => [...row, '']),
                      }
                    : table
            )
        );
    };

    const deleteColumn = () => {
        if (hotRef.current) {
            const selected = hotRef.current.hotInstance.getSelected();
            if (selected && selected.length > 0) {
                const colsToDelete = selected.map(([, col]) => col);
                const uniqueCols = [...new Set(colsToDelete)].sort((a, b) => b - a);
    
                setTables((prevTables) =>
                    prevTables.map((table) =>
                        table.id === activeTableId
                            ? {
                                  ...table,
                                  data: table.data.map((row) =>
                                      row.filter((_, index) => !uniqueCols.includes(index))
                                  ),
                              }
                            : table
                    )
                );
            }
        }
    };

    const saveTable = async () => {
        try {
            const response = await axios.post('/api/save-table', { data });
            console.log('Table saved successfully:', response.data);
            alert('Таблица сохранена!');
        } catch (error) {
            console.error('Error saving table:', error);
            alert('Ошибка при сохранении таблицы');
        }
    };

    const evaluateFormula = (formula, tableData) => {
        try {
            if (formula.startsWith('=СУММ(')) {
                const range = formula.slice(6, -1).trim(); // Извлекаем диапазон
                const cells = parseRange(range, tableData);
                return cells.reduce((sum, val) => sum + (parseFloat(val) || 0), 0); // Суммируем значения
            } else if (formula.startsWith('=СРЗНАЧ(')) {
                const range = formula.slice(8, -1).trim(); // Извлекаем диапазон
                const cells = parseRange(range, tableData);
                const numbers = cells.map((val) => parseFloat(val)).filter((val) => !isNaN(val)); // Оставляем только числа
                return numbers.length ? (numbers.reduce((sum, val) => sum + val, 0) / numbers.length) : 0; // Среднее значение
            }
            return formula; // Если это не формула, возвращаем значение как есть
        } catch (error) {
            console.error('Ошибка при обработке формулы:', formula, error);
            return 'Ошибка';
        }
    };
    
    
    const parseRange = (range, tableData) => {
        const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
        if (!match) throw new Error(`Некорректный диапазон: ${range}`);
    
        const [_, startCol, startRow, endCol, endRow] = match;
    
        const colToIndex = (col) =>
            col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
    
        const startColIndex = colToIndex(startCol);
        const endColIndex = colToIndex(endCol);
        const startRowIndex = parseInt(startRow, 10) - 1;
        const endRowIndex = parseInt(endRow, 10) - 1;
    
        const cells = [];
        for (let row = startRowIndex; row <= endRowIndex; row++) {
            for (let col = startColIndex; col <= endColIndex; col++) {
                cells.push(tableData[row]?.[col] || ''); // Проверяем, что данные существуют
            }
        }
        return cells;
    };

    const handleAfterChange = (changes) => {
        if (!changes) return;

        setTables((prevTables) =>
            prevTables.map((table) => {
                if (table.id === activeTableId) {
                    const newData = [...table.data];
                    const newFormulas = { ...formulas };

                    changes.forEach(([row, col, oldVal, newVal]) => {
                        const cellKey = `${row}_${col}`;
                    
                        if (typeof newVal === 'string' && newVal.startsWith('=')) {
                            // Сохраняем новую формулу
                            newFormulas[cellKey] = newVal;
                            // Вычисляем значение
                            const evaluated = evaluateFormula(newVal, newData);
                            newData[row][col] = evaluated;
                        } else {
                            // Удаляем формулу, если введено обычное значение
                            delete newFormulas[cellKey];
                            newData[row][col] = newVal;
                        }
                    });

                    setFormulas(newFormulas);
                    return { ...table, data: newData };
                }
                return table;
            })
        );
    };
        

    const handleAfterSelection = (row, col) => {
        const cellKey = `${row}_${col}`;
        if (formulas[cellKey]) {
            hotRef.current.hotInstance.setDataAtCell(row, col, formulas[cellKey]); // Отображаем формулу
        }
    };
        
    const handleAfterDeselect = () => {
        setTables((prevTables) =>
            prevTables.map((table) => {
                if (table.id === activeTableId) {
                    const newData = [...table.data];
                    Object.keys(formulas).forEach((key) => {
                        const [row, col] = key.split('_').map(Number);
                        if (formulas[key]) {
                            newData[row][col] = evaluateFormula(formulas[key], newData); // Пересчитываем значение
                        }
                    });
                    return { ...table, data: newData };
                }
                return table;
            })
        );
    };
        
        
    return (
        <div>
            <ErrorBoundary>
                <div className="table-container">
                    <h2></h2>
                    <div>
                        {tables.map(table => (
                            <div key={table.id} style={{ display: 'inline-block', marginRight: '10px' }}>
                                <button className="table-button" onClick={() => switchTable(table.id)}>
                                    {table.name}
                                </button>
                                <button className="delete-button" onClick={() => deleteTable(table.id)}>Удалить</button>
                            </div>
                        ))}
                        <button className="add-table-button" onClick={addTable}>Добавить Таблицу</button>
                    </div>
                </div>
                <BottomBar
                    onFontChange={handleFontChange}
                    onFontSizeChange={handleFontSizeChange}
                    onBoldToggle={toggleBold}
                    onItalicToggle={toggleItalic}
                    onTextColorChange={handleTextColorChange}
                    onBgColorChange={handleBgColorChange}
                    onAlignChange={handleAlignChange}
                    onAddRow={addRow}
                    onDeleteRow={deleteRow}
                    onAddColumn={addColumn}
                    onDeleteColumn={deleteColumn}
                    onSaveTable={saveTable}
                />
                <HotTable
                    ref={hotRef}
                    data={tables.find(table => table.id === activeTableId).data} // Get data for active table
                    rowHeaders={true}
                    colHeaders={true}
                    licenseKey='non-commercial-and-evaluation'
                    height="auto"
                    autoWrapRow={true}
                    manualRowResize={true}
                    manualColumnResize={true}
                    outsideClickDeselects={false}
                    afterChange={handleAfterChange}
                    formulas={{ engine: HyperFormula.buildEmpty() }}
                    afterSelection={(row, col) => handleAfterSelection(row, col)}
                    afterDeselect={() => handleAfterDeselect()}
                />
            </ErrorBoundary>
        </div>
    );
    };

export default MyTable;
