import './App.css';
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import {useEffect, useState} from "react";
import moment from "moment";
import {ActionSheet} from "antd-mobile";
import axios from "axios";

const local_key = '_dq_calendar_data_';
const actions = [
  {text: '正常', key: '1'},
  {text: '请假', key: '2'},
  {text: '休息', key: '3'},
  {text: '未知', key: '9'},
]

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState({});
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const initData = async () => {
    let calendarData;
    try {
      const res = await axios('/calendar/data');
      if (res.data && res.data.data) {
        calendarData = res.data.data;
      }
    } catch (e) {
      calendarData = localStorage.getItem(local_key) || '{}';
    }
    setData(JSON.parse(calendarData));
  }

  const onClickDay = (date) => {
    setSelectedDate(date);
    setActionSheetVisible(true);

  }
  const onAction = (action) => {
    const ymd = moment(selectedDate).format('YYYY-MM-DD');
    const newData = {
      ...data,
      [ymd]: action.text
    }
    setData(newData);
    setActionSheetVisible(false);
    localStorage.setItem(local_key, JSON.stringify(newData));
    try {
      axios.post('/calendar/data', newData)
    } catch (e) {

    }
  }

  const tileClassFunc = ({activeStartDate, date, view}) => {
    if (view !== 'month') {
      return null;
    }
    if (moment(date).format('YYYY-MM') !== moment(selectedDate).format('YYYY-MM')) {
      return null;
    }
    const ymd = moment(date).format('YYYY-MM-DD');
    const actionName = data[ymd] || '未知';
    const actionKey = actions.find(x => x.text === actionName).key;
    return "square_" + actionKey
  }

  const tileContentFunc = ({activeStartDate, date, view}) => {
    if (view !== 'month') {
      return null;
    }
    const ymd = moment(date).format('YYYY-MM-DD');
    const actionName = data[ymd] || '未知';
    return <div>{actionName}</div>
  }

  const renderStats = () => {
    const lines = []
    const firstDay = moment(selectedDate).date(1);
    const lastDay = moment(selectedDate).date(1).add(1, 'months').add(-1, 'days');
    for (let i = 0; i < lastDay.date(); i++) {
      const ymd = moment(firstDay).add(i, 'days').format('YYYY-MM-DD');
      const type = data[ymd] || '未知';
      let line = lines.find(x => x.name === type);
      if (line == null) {
        line = {name: type, value: 0}
        lines.push(line);
      }
      line.value += 1;
    }
    const total = lines.map(x => x.value).reduce((a, b) => a + b, 0);
    lines.push({name: '共计', value: total});
    return <>{lines.map(line => <div key={line.name}>{line.name}: {line.value}天</div>)}</>
  }

  useEffect(() => {
    initData()
  }, [])

  return (
    <div>
      <Calendar className="calendar" onClickDay={onClickDay} tileClassName={tileClassFunc}
                tileContent={tileContentFunc}/>
      <div className="logs">
        {renderStats()}
      </div>
      <ActionSheet
        extra='请选择当天状态'
        cancelText='取消'
        visible={actionSheetVisible}
        actions={actions}
        onAction={onAction}
        onClose={() => setActionSheetVisible(false)}
      />
    </div>
  );
}

export default App;
