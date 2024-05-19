import { StatusBar } from "expo-status-bar";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [opacitys, setOpacitys] = useState(0);

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  const travel = () => {
    setWorking(false);
    saveMode("travel");
  };
  const work = () => {
    setWorking(true);
    saveMode("work");
  };

  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working } };

    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do?", " Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  const completeToDo = async (key) => {
    setOpacitys(opacitys + 1);
    console.log(opacitys);
    const updateToDos = { ...toDos };
    if (opacitys % 2 === 0) {
      updateToDos[key].completed = true;
    } else {
      updateToDos[key].completed = false;
    }
    setToDos(updateToDos);
    await saveToDos(updateToDos);
  };

  const saveMode = async (mode) => {
    await AsyncStorage.setItem(MODE_KEY, mode);
  };
  const loadMode = async () => {
    const mode = await AsyncStorage.getItem(MODE_KEY);
    if (mode !== null) {
      setWorking(mode === "work");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        autoCapitalize={"none"}
        returnKeyType="done"
        value={text}
        onChangeText={onChangeText}
        placeholder={working ? "Todo" : "let's go"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View
              style={{
                ...styles.toDo,
                opacity: toDos[key].completed ? 0.5 : 1,
              }}
              key={key}
            >
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity>
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <FontAwesome
                    name="check"
                    color="white"
                    size={20}
                    onPress={() => completeToDo(key)}
                  />
                  <FontAwesome name="pencil" color="white" size={20} />
                  <FontAwesome
                    name="trash"
                    color="white"
                    size={20}
                    onPress={() => deleteToDo(key)}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 60,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginVertical: 100,
  },
  btnText: {
    fontWeight: "600",
    fontSize: 80,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 40,
    marginTop: 35,
    fontSize: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 20,
  },
});
