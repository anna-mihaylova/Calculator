(function() {
    document.addEventListener("DOMContentLoaded", function(event) {
        let $parent = document.querySelector('#calculator');
        let $result = $parent.querySelector('#result');
        let $temporaryResult = $result.querySelector('#temporaryResultStrong');
        let operator = '';
        let stack = [];
        let isRemoved = true;

        $parent.addEventListener('click', function(e) {
            let $el = e.target;
            let type = $el.getAttribute('data-type');
            let val = $el.value;

            switch (type) {
                case 'number':
                    addNumber(val, type);
                    break;
                case 'operator':
                    addOperator(val, type);
                    break;
                case 'period':
                    addPeriod(val, type);
                    break;
                case 'negative':
                    addNegative(val, type);
                    break;
                case 'deleteAll':
                    deleteAll();
                    break;
                case 'delete':
                    deleteLast(val, type);
                    break;
                case 'equal':
                    result(val, type);
                    break;
            }
        });

        document.addEventListener('keydown', function(e) {

            if (e.key === '0' || e.key === '1' || e.key === '2' ||
                e.key === '3' || e.key === '4' || e.key === '5' ||
                e.key === '6' || e.key === '7' || e.key === '8' || e.key === '9') {
                return addNumber(e.key, 'number');
            }

            if (e.key === '/' || e.key === '*' || e.key === '-' ||
                e.key === '+' || e.key === '%') {
                return addOperator(e.key, 'operator');
            }

            if (e.key === '.' || e.key === ',') {
                return addPeriod('.', 'period');
            }

            if (e.key === '(' && e.key === '-') {
                return addNegative('(-', 'negative');
            }

            if (e.key === 'Backspace') {
                return deleteLast('CE', 'delete');
            }

            if (e.key === 'Delete') {
                return deleteAll('C', 'deleteAll');
            }

            if (e.key === '=' || e.key === 'Enter') {
                return result(e.key, 'equal');;
            }

        });

        function addNumber(number, type) {
            number = +number;
            let length = stack.length;
            let num = stack[length - 1] * 10;
            let str = stack[length - 1] + '';

            if (number != 0 && length === 0) {
                stack.push(number);
                return render(number, type);
            }

            if (str.endsWith('.') || str.endsWith('(-')) {
                stack.push(number);
                return render(number, type);
            }

            if (number === 0 && length === 0) {
                number = '0.';
                stack.push(number);
                return render(number, type);
            }

            if (stack[length - 1] === 0) {
                del = true;
                render(number, type, true, del);
                return stack[length - 1] = number;
            }

            if (!isNaN(num)) {
                num += number;
                if (!isSaveNumber(num)) {
                    return;
                }
            } else {
                stack.push(number);
            }

            render(number, type);
        }

        function addOperator(operator, type) {
            let length = stack.length;
            let num = stack[length - 1] * 10;
            let str = stack[length - 1] + '';

            if (length === 0 || str.endsWith('.') || str.endsWith('(-')) {
                isRemoved = false;
                alert(`You can't add ${operator} operator now!`);
                return render(operator, type, isRemoved);
            }

            if (length != 0) {
                let del = false;
                if (!isNaN(num)) {
                    stack[length] = operator;
                } else {
                    del = true;
                    render(operator, type, true, del);
                    return stack[length - 1] = operator;
                }
            }
            render(operator, type);
            return stack;
        }

        function addPeriod(value, type) {
            let length = stack.length;
            let num = stack[length - 1] * 10;
            let str = stack[length - 1] + '';
            let str2 = stack[length - 2] + '';

            if (length === 0 || (length != 0 && isNaN(num)) && stack[length - 1] != '.') {
                value = 0 + value;
                stack[length] = value;
                return render(value, type);
            }

            if (isNaN(num) || str.endsWith('.') || (str2 && str.endsWith('.'))) {
                alert('You can\'t add period now!');
                return render(operator, type, false);
            }

            if (!isNaN(num)) {
                if (isPreviousElementIsPeriod()) {
                    stack[length] = value;
                    return render(value, type);

                } else {
                    alert('You can\'t add period now!');
                    return render(operator, type, false);

                }
            }
        }

        function addNegative(value, type) {
            let length = stack.length;
            let num = stack[length - 1] * 10;
            let str = stack[length - 1] + '';
            value = '(-';

            if (length === 0) {
                stack.push('(-');
                return render(value, type);
            }

            if (length === 1 && stack[length - 1] === '(-') {
                stack.pop();
                return deleteLast();
            }

            if (isNaN(num) && stack[length - 1] != '.') {

                if (stack[length - 1] === '(-') {
                    stack.splice(length - 1, 1);
                    return deleteLast();
                } else {
                    stack.push('(-');
                    return render(value, type);
                }
            }

            if (!isNaN(num)) {
                return alert('You can\'t add negative number operator now!');
            }
        }

        function result(value, type) {
            stack = doubleNumber();
            stack = negativeNumber();
            stack = percentage();

            let sum = stack[0];
            if (stack.length === 0) {
                return alert('You must add first operators and operands!');
                sum = 0;
            }
            for (let i = 0; i < stack.length; i++) {
                if ((Number.MIN_SAFE_INTEGER < sum) && (sum < Number.MAX_SAFE_INTEGER)) {
                    switch (stack[i]) {
                        case '+':
                            sum += stack[i + 1];
                            break;
                        case '-':
                            sum -= stack[i + 1];
                            break;
                        case '/':
                            sum /= stack[i + 1];
                            break;
                        case '*':
                            sum *= stack[i + 1];
                            break;
                    }
                } else {
                    return alert('The result is very big number. Max safe number is 9007199254740991. And this result is no safe!');
                }
            }
            deleteAll();
            sum = parseFloat(+sum.toFixed(5));
            createTempResult(sum);
        }

        function deleteLast(number, type) {
            let num = stack[stack.length - 1] / 10;
            let str = stack[stack.length - 1] + '';

            if (isNaN(num) || str.endsWith('.')) {
                stack.pop();
            } else {
                if (stack[stack.length - 1] = Math.floor(num) != 0) {
                    stack[stack.length - 1] = Math.floor(num);
                } else {
                    stack.pop();
                }
            }
            removeLastChildResult();
        }

        function deleteAll() {
            stack = [];
            deleteResult();
            render();
        }

        function render(value, type, isRemoved = true, del = false) {
            deleteFirstZero();

            if (arguments.length === 0) {
                deleteResult();
                return createFirstZero();
            }

            if (isRemoved) {
                let $text = '';
                let str = value + '';
                if (del) {
                    $result.removeChild($result.lastChild);
                    value = '  ' + value + '  ';
                }
                if ((str.length > 1 && str.startsWith('-'))) {
                    $result.removeChild($result.childNodes[0]);
                }
                if ((value === '.') || (type != 'operator')) {}
                if (value === '0.') {
                    value = '  ' + value;
                } else {
                    value = '  ' + value + '  ';
                }
            }
            createChildResult(value);
        }

        function isSaveNumber(num, type) {
            let length = stack.length - 1;
            if (Number.isSafeInteger(num)) {
                stack[length] = num;
            } else {
                alert('Max number is 9007199254740991');
                let isRemoved = false;
                return render(num, type, isRemoved);
            }
            return stack;
        }

        function isPreviousElementIsPeriod() {
            let length = stack.length;
            let str = stack[length - 1] + '';
            let str2 = stack[length - 2] + '';
            let canPoint = true;

            if (stack[length - 1] === '.' || str.endsWith('.')) {
                canPoint = false;
            }
            if (stack[length - 2] && stack[length - 2] === '.' || str2.endsWith('.')) {
                canPoint = false;
            }
            return canPoint;
        }

        function previousPreviousElement() {
            return stack[stack.length - 2];
        }

        function doubleNumber() {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i] === '.') {
                    let num = stack[i - 1] * 10;
                    let num2 = stack[i + 1] * 10;
                    if ((stack[i - 1] && !isNaN(num)) && (stack[i + 1] && !isNaN(num2))) {
                        let number = +stack[i - 1] + stack[i] + stack[i + 1];
                        stack.splice((i - 1), 3, number);
                    }
                }
                if (stack[i] === '0.') {
                    let num = stack[i + 1] * 10;
                    if (stack[i + 1] && !isNaN(num)) {
                        let number = +('0.' + stack[i + 1]);
                        stack.splice((i), 2, number);
                    }
                }
            }
            return stack;
        }

        function negativeNumber() {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i] === '(-') {
                    if (stack[i + 1]) {
                        let number = +('-' + stack[i + 1]);
                        stack.splice((i), 2, number);
                    }
                }
            }
            return stack;
        }

        function percentage() {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i] === '%') {
                    let num = stack[i - 1] * 10;
                    let num2 = stack[i + 1] * 10;
                    if ((stack[i - 1] && !isNaN(num)) && (stack[i + 1] && !isNaN(num2))) {
                        let number = (stack[i - 1] / 100) * stack[i + 1];
                        stack.splice((i - 1), 3, number);
                    }
                }
            }
            return stack;
        }

        function createChildResult(value) {
            let $text = document.createTextNode(`${value}`);
            let $p = document.createElement('p');
            $p.setAttribute('class', 'inline');
            let $strong = document.createElement('STRONG');
            $strong.appendChild($text);
            $p.appendChild($strong);
            $result.appendChild($p);
        }

        function createNegativeResult(value) {
            let $text = document.createTextNode(value);
            let $p = document.createElement('p');
            $p.setAttribute('class', 'inline');
            let $strong = document.createElement('STRONG');
            $p.appendChild($strong);
            $strong.appendChild($text);
            $result.appendChild($p);
        }

        function removeLastChildResult() {
            if ($result.children.length === 1) {
                $result.removeChild($result.lastChild);
                createFirstZero();
            }
            if ($result.children.length > 1) {
                $result.removeChild($result.lastChild);
            }
        }

        function createFirstZero() {
            let $text = document.createTextNode(0);
            let $strong = document.createElement('STRONG');
            $strong.setAttribute('id', 'resultStrong');
            $strong.appendChild($text);
            $result.appendChild($strong);
        }

        function deleteFirstZero() {
            let $resultStrong = $result.firstChild;
            if (document.getElementById("resultStrong") && isRemoved) {
                document.getElementById("resultStrong").remove();
            }
        }

        function createTempResult(value) {
            let $text = document.createTextNode(value);
            let $strong = document.createElement('STRONG');
            $strong.setAttribute('id', 'temporaryResultStrong');
            $strong.appendChild($text);
            $result.appendChild($strong);
        }

        function createResult(value) {
            let $text = document.createTextNode(value);
            let $strong = document.createElement('STRONG');

            $strong.setAttribute('id', 'temporaryResult');
            $strong.appendChild($text);
        }

        function deleteResult() {
            while ($result.firstChild) {
                $result.removeChild($result.firstChild);
            }
        }
    });
})();
