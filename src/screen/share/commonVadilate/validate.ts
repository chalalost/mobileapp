export interface IError {
    fieldName: string | '',
    mes: string | ''
}

export interface IRule {
    field: string | '',
    required: boolean | false,
    maxLength: number | 0,
    minLength: number | 0,
    typeValidate: number | 0,
    valueCheck: any,
    maxValue: number | 0,
    messages: {
        required: string | '',
        maxLength: string | '',
        minLength: string | '',
        validate: string | '',
        maxValue: string | '',
    },
}
export const typeVadilate = {
    Phone: 1,
    Email: 2,
    Name: 3,
    Number: 4,
    numberv1: 5, // float lon hon 0
    Number_Negative: 6
};
const validateForm = (dataObj: any, rules: IRule[], errorsOld: IError[]) => {
    var errors = errorsOld == null || errorsOld == undefined ? [] as IError[] : Object.assign([], errorsOld);
    if (dataObj != undefined && dataObj != null) {
        rules.map((itemRule, i) => {
            let error: IError = {
                fieldName: '',
                mes: ''
            };
            let fieldName = itemRule.field;
            let datafield = dataObj[fieldName] == undefined || dataObj[fieldName] == null ? "" : dataObj[fieldName];
            error = approveRules(datafield, fieldName, itemRule);
            var fieldexist = errors.find((g) => g.fieldName === fieldName);
            if (!fieldexist) {
                if (error.fieldName != "") {
                    errors.push(error);
                }
            }
        });
    }
    //check term of condition
    return errors;
}

const validateField = (data: any, rules: IRule[], fieldName: any, errors: IError[]) => {
    let dataField = data == undefined || data == null ? "" : data;
    let error: IError = {
        fieldName: "",
        mes: "",
    };

    rules.map((item) => {
        if (item.field == fieldName) {
            error = approveRules(dataField, fieldName, item); // dataField String | Number

        }
    });
    errors = removeError(errors, fieldName);
    errors = (errors == null || errors == undefined) ? [] as IError[] : errors;
    var fieldexist = errors.find((g) => g.fieldName === fieldName);
    if (!fieldexist) {
        if (error.fieldName != "") {
            errors.push(error);
        }
    }
    return errors; // tra ra lis loi moi cung data moi'
}


const approveRules = (dataField: any, fieldName: string, itemRule: IRule) => { // dataField String | Number
    let error: IError = {
        fieldName: "",
        mes: "",
    };
    if ((dataField === undefined || dataField === "") && itemRule.required == true) {
        error = {
            fieldName: fieldName,
            mes:
                itemRule.messages.required != null
                    ? itemRule.messages.required
                    : "Vui lòng nhập thông tin",
        };
        return error;
    }
    if (dataField != "") {
        if (itemRule.minLength > 0 && dataField.length < itemRule.minLength) {
            error = {
                fieldName: fieldName,
                mes:
                    itemRule.messages.minLength != null
                        ? itemRule.messages.minLength
                        : "Phải nhập ít nhất " + itemRule.minLength + " ký tự",
            };
            return error;
        }
        if (itemRule.maxLength > 0 && dataField.length > itemRule.maxLength) {
            error = {
                fieldName: fieldName,
                mes:
                    itemRule.messages.maxLength != null
                        ? itemRule.messages.maxLength
                        : "Không được vượt quá " + itemRule.maxLength + " ký tự",
            };
            return error;
        }

        if (itemRule.typeValidate == typeVadilate.numberv1) {
            if (itemRule.valueCheck.test(dataField) == false || parseFloat(dataField) <= 0) {
                error = {
                    fieldName: fieldName,
                    mes: itemRule.messages.validate != null
                        ? itemRule.messages.validate : "Giá trị không hợp lệ"
                }
                return error;
            }
        }
        if (itemRule.typeValidate == typeVadilate.Number) {
            if (itemRule.valueCheck.test(dataField) == false || parseFloat(dataField) < 0) {
                error = {
                    fieldName: fieldName,
                    mes: itemRule.messages.validate != null
                        ? itemRule.messages.validate : "Giá trị không hợp lệ"
                }
                return error;
            }
        }

        if (itemRule.typeValidate == typeVadilate.Number_Negative) {
            if (itemRule.valueCheck.test(dataField) == false || parseFloat(dataField) == 0) {
                error = {
                    fieldName: fieldName,
                    mes: itemRule.messages.validate != null
                        ? itemRule.messages.validate : "Giá trị không hợp lệ"
                }
                return error;
            }
        }
        if (itemRule.maxValue == 1) {
            if (parseFloat(dataField) > 1) {
                error = {
                    fieldName: fieldName,
                    mes: itemRule.messages.maxValue != null
                        ? itemRule.messages.maxValue : "Giá trị không vượt quá 1"
                }
                return error;
            }
        }
        // if (itemRule.maxValue == 0) {
        //     if (parseInt(dataField) < 0) {
        //         error = {
        //             fieldName: fieldName,
        //             mes: itemRule.messages.maxValue != null
        //                 ? itemRule.messages.maxValue : "Giá trị không vượt quá 0"
        //         }
        //         return error;
        //     }
        // }

        // check type doan nay
    }
    return error;
}

const removeError = (errors: IError[], fieldName: string) => {
    let idx = -1;
    if (errors && errors.length > 0 && fieldName != "") {
        errors.map((item, i) => {
            if (item.fieldName == fieldName) {
                idx = i;
            }
        });
    }
    if (idx >= 0) {
        errors.splice(idx, 1);
    }
    return errors;
};

const generateGuid = function () {
    return (
        mes_s4() +
        mes_s4() +
        "-" +
        mes_s4() +
        "-" +
        mes_s4() +
        "-" +
        mes_s4() +
        "-" +
        mes_s4() +
        mes_s4() +
        mes_s4()
    );
};
const mes_s4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};


export { validateField, validateForm, generateGuid };