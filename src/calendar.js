function createCalendar(){
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    table.appendChild(thead);
    table.appendChild(tbody);

    document.getElementById('body').appendChild(table);
    let dayOfWeek = "일월화수목금토";
    thead.appendChild(document.createElement('tr'));
    for(let d=0; d<7; d++){
        let th_tmp = document.createElement('th');
        //th_tmp.innerHTML = "<p>"+dayOfWeek[d]+"</p>";
        th_tmp.innerHTML = dayOfWeek[d];
        thead.append(th_tmp);
    }

    let year = 2022;
    let month = 12;
    let startDate = new Date(year,month-1,1,0,1);
    if(month == 12){
        year += 1;
        month = 1;
    }
    else{
        month += 1;
    }
    let endDate = new Date(year,month-1,1,0,0);
    endDate.setDate(endDate.getDate()-1);
    let startDayOffset = startDate.getDay();
    let dateNum = endDate.getDate();
    let weekNum = Math.ceil((startDayOffset -1 + dateNum)/7);
    let num = 1; 
    for(let j = 0; j < weekNum; j++){
        let tr_tmp = document.createElement('tr');
        tbody.append(tr_tmp);
        for(let i = 0; i < 7; i++){
            let td_tmp = document.createElement('td');
            tr_tmp.appendChild(td_tmp);
            if(j == 0 && i < startDayOffset){
                continue;
            }
            
            if(num > dateNum) continue;

            td_tmp.innerHTML = num;
            num+=1;
        }

        tr_tmp = document.createElement('tr');
        tbody.append(tr_tmp);
        for(let i = 0; i < 7; i++){
            let td_tmp = document.createElement('td');
            tr_tmp.appendChild(td_tmp);
        }
    }
}

createCalendar()