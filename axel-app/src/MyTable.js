// MyTable.js
import React, { useRef, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';

registerAllModules();

const MyTable = () => {
    const hotRef = useRef(null);

    const initialData = Array.from({ length: 100 }, (_, rowIndex) => {
        return Array.from({ length: 100 }, (_, colIndex) => {
            return rowIndex === 0 ? `Column ${colIndex + 1}` : ''; 
        });
    });

    return (
        <HotTable
            ref={hotRef}
            data={initialData}
            rowHeaders={true}
            colHeaders={true}
            licenseKey='non-commercial-and-evaluation'
            height="auto"
            autoWrapRow={true}
            manualRowResize={true}
            manualColumnResize={true}
            formulas={{ engine: HyperFormula.buildEmpty() }} // Подключаем HyperFormula
        />
    );
};

export default MyTable;