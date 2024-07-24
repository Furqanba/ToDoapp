import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data', e);
  }
};

const getData = async key => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data', e);
  }
};

const TaskItem = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onViewDetails,
}) => {
  return (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => onToggleComplete(task.id)}>
        <Text style={task.completed ? styles.completed : styles.taskText}>
          {task.title}
        </Text>
      </TouchableOpacity>
      <View style={styles.taskButtons}>
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.button}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          style={styles.button}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onViewDetails(task)}
          style={styles.button}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Appp = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    async function loadTasks() {
      const storedTasks = await getData('tasks');
      if (storedTasks) setTasks(storedTasks);
    }
    loadTasks();
  }, []);

  useEffect(() => {
    storeData('tasks', tasks);
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (task.trim()) {
      if (editingTask) {
        setTasks(
          tasks.map(t => (t.id === editingTask.id ? {...t, title: task} : t)),
        );
        setEditingTask(null);
      } else {
        setTasks([
          ...tasks,
          {
            id: Date.now(),
            title: task,
            completed: false,
            description,
            date,
            time,
          },
        ]);
      }
      setTask('');
      setDescription('');
      setDate(null);
      setTime(null);
    }
  };

  const editTask = task => {
    setTask(task.title);
    setDescription(task.description || '');
    setDate(task.date || null);
    setTime(task.time || null);
    setEditingTask(task);
  };

  const toggleComplete = id => {
    setTasks(
      tasks.map(task =>
        task.id === id ? {...task, completed: !task.completed} : task,
      ),
    );
  };

  const deleteTask = id => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const viewDetails = task => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={task}
        onChangeText={setTask}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity onPress={showDatepicker} style={styles.addButton}>
        <Text style={styles.addButtonText}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <TouchableOpacity onPress={showTimepicker} style={styles.addButton}>
        <Text style={styles.addButtonText}>Select Time</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTime}
        />
      )}
      <TouchableOpacity onPress={addOrUpdateTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>
          {editingTask ? 'Update Task' : 'Add Task'}
        </Text>
      </TouchableOpacity>
      <View style={styles.filters}>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={filter === 'all' ? styles.selectedButton : styles.button}>
          <Text style={styles.buttonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('completed')}
          style={
            filter === 'completed' ? styles.selectedButton : styles.button
          }>
          <Text style={styles.buttonText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('pending')}
          style={filter === 'pending' ? styles.selectedButton : styles.button}>
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TaskItem
            task={item}
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
            onEdit={editTask}
            onViewDetails={viewDetails}
          />
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Task Details</Text>
          {selectedTask && (
            <>
              <Text style={styles.modalText}>Title: {selectedTask.title}</Text>
              <Text style={styles.modalText}>
                Description: {selectedTask.description}
              </Text>
              <Text style={styles.modalText}>
                Date:{' '}
                {selectedTask.date
                  ? new Date(selectedTask.date).toLocaleDateString()
                  : 'No date set'}
              </Text>
              <Text style={styles.modalText}>
                Time:{' '}
                {selectedTask.time
                  ? new Date(selectedTask.time).toLocaleTimeString()
                  : 'No time set'}
              </Text>
            </>
          )}
          <Button
            title="Close"
            onPress={() => setModalVisible(!modalVisible)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#43cc9c',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: wp('2%'),
    marginBottom: hp('2%'),
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: hp(2),
  },
  addButton: {
    backgroundColor: '#2080c9',
    padding: wp('3%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('2%'),
  },
  button: {
    backgroundColor: '#2080c9',
    padding: wp('2%'),
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: wp('0.5%'),
  },
  selectedButton: {
    backgroundColor: '#2080c9',
    padding: wp('2%'),
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: wp('0.5%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('3.5%'),
  },
  taskItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  taskText: {
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('1%'),
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
  },
  taskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Appp;
