//const demo = true;
export const pressButtons = async (driver, ...buttons) => {
    for(const btn of buttons){
        await driver.elementByAccessibilityId(btn.toString()).click();
        // if (demo) {
        //     await new Promise(r => setTimeout(r, 100));
        // }
    }
}

export const plus = 'plus';
export const minus = 'minus';
export const multiply = 'multiply';
export const divide = 'divide';
export const equals = 'equals';
export const clear = 'clear';
export const point = 'point';

export const pointChar = '·';
export const multiplyChar = '×';
export const divideChar = '÷';