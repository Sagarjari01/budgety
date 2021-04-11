var budgetController = (function(){
    
    //constructor
    var Expense = function(id, description, value){
        
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome> 0){
                this.percentage = Math.round((this.value / totalIncome)*100);    
            } else{
                this.percentage = -1;
            }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotals = function(type) {
        
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;  
        });
        data.totals[type] = sum;
        
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItems, ID;
            
            //ID [1 2 3 4]
            //ID = last id +1
            
            //create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    
            }
            else{
                ID = 0;
            }
            
            //create newItem based on exp and inc
            if(type === 'exp'){
                newItems = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItems = new Income(ID, des, val);
            }
            
            //push it into our data structures
            data.allItems[type].push(newItems);
            
            //return newItems 
            return newItems;
        },
        
        deleteItem: function(type, id){
            var ids;
            
            ids = data.allItems[type].map(function(current){
                return current.id; // [1 2 4 6 8]
            });
            
            if(ids !== -1){
                data.allItems[type].splice(id, 1);
            }
            
        },
        
        calculateBudget: function(){
            
            //calculate total income and expenses
            calculateTotals('exp');
            calculateTotals('inc');
            
            //calculate the budget: income-expense
            data.budget = data.totals.inc-data.totals.exp;
            
            //calculate percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentage : function() {
            var allprec = data.allItems.exp.map(function(cur){
                return cur.getPercentage(); 
            });
            return allprec;
        },
        
        getbudget: function(){
            return{
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };
        },
        
        testing: function(){
            console.log(data);
        }
    };
     
    
})();


var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputbtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetVal: '.budget__value',
        budgetIncomeVal: '.budget__income--value',
        budgetExpenseVal: '.budget__expenses--value',
        budgetExpensePercentage: '.budget__expenses--percentage',
        container : '.container',
        expensePerLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
     var numFormat= function(num, type){
            
            var numSplit, int, dec;
            //to place sign
            //place comma
            //2 decimal only
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];//1200.00
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);    
            }

            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+')+ ' ' + int + '.' + dec;
        };
    
     var nodeListForEach = function(list, callback){
                
                for(var i=0; i<list.length; i++){
                    callback(list[i], i);
                }
            };
    
    return {
        getInput: function(){
            return{
                 type : document.querySelector(DOMstrings.inputType).value,
                 description : document.querySelector(DOMstrings.inputDescription).value,
                 value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            //create HTML string with placeHolder 
            if(type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type = 'exp'){
                
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //giving place holder for obj
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', numFormat(obj.value, type));
            
            //Insert into the dom
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayBudget:function(obj){
            
            var type;
            
            obj.budget > 0 ? type = 'inc': type = 'exp'; 
           
            document.querySelector(DOMstrings.budgetVal).textContent = numFormat(obj.budget, type);
            document.querySelector(DOMstrings.budgetExpenseVal).textContent = numFormat(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.budgetIncomeVal).textContent = numFormat(obj.totalInc, 'inc');
            
            
            if(obj.percentage >= 0){
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = obj.percentage+ "%";    
            }else{
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = "---"; 
            }
            
        },
        
        /*difficult*/
        displayPercentages: function(percentages){
          
            var fields = document.querySelectorAll(DOMstrings.expensePerLabel);
            
           
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages>0){
                    
                    current.textContent = percentages + "%";
                }
                else{
                    current.textContent = "---";
                }
                
            });
            
        },
        
        
        clearFields: function(){
            var fields, fieldArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldArr = Array.prototype.slice.call(fields);
            
            fieldArr.forEach(function(current, index, array){
                current.value = "";
            });
        },
        
        displayMonth: function(){
          
            var now, year, month, months;
             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();
            
            months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] +" "+ year;
        },
        
        changeType: function(){
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +                                                             DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputbtn).classList.toggle;
        },
        
        
        getDOMstrings: function(){
            return DOMstrings;
        }
        
    };
})();

var controller = (function(budgetctrl, UIctrl){ 
  
    var setUpEventListeners = function(){
        var DOM = UIctrl.getDOMstrings();
        document.querySelector(DOM.inputbtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress',function(e){
            if(e.keyCode === 13){
                ctrlAddItem();
            }
    });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
        
    };
    
    var updateBudget = function(){
        
        //1. calculate the budget
        budgetctrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetctrl.getbudget();
        
        //3. display the budget on UI
        UIctrl.displayBudget(budget);
        
    };
    
    var updatePercentage = function(){
      
        //1. calculate percentage
        budgetctrl.calculatePercentages();
        
        //2. read percentage from the budget controller
        var percentage = budgetctrl.getPercentage();
        
        //3. update UI with the new percentage
        UIctrl.displayPercentages(percentage);
    };
   
    var ctrlAddItem = function(){
        var input, newItems;
        //1. get the field input data
        input = UIctrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
                //2. add the item to budgetctrl
                newItems = budgetctrl.addItem(input.type, input.description, input.value);

                //3. add item to UI
                UIctrl.addListItem(newItems, input.type);

                //4. clear input fields
                UIctrl.clearFields();

                //5. update budget
                updateBudget();
            
                //6. update percentage
                updatePercentage();
           }
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. delete item from data structures
            budgetctrl.deleteItem(type, ID);
            
            //2. delete data from UI
            UIctrl.deleteListItem(itemID);
            
            //3.update and show new UI
            updateBudget();
            
            //4. update percentage
            updatePercentage();
            
        }
    };
    
    return {
        init: function(){
            console.log("app started");
            UIctrl.displayMonth();
            UIctrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();



