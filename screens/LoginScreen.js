import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function LoginScreen({ styles, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const USERS = [
    { username: "pedro", password: "Pedro2026*" },
    { username: "equipo1", password: "Salud2026*" },
    { username: "equipo2", password: "Salud2026*" },
    { username: "equipo3", password: "Salud2026*" },
    { username: "equipo4", password: "Salud2026*" },
    { username: "equipo5", password: "Salud2026*" },
    { username: "equipo6", password: "Salud2026*" },
    { username: "equipo7", password: "Salud2026*" },
    { username: "equipo8", password: "Salud2026*" },
    { username: "equipo9", password: "Salud2026*" },
    { username: "equipo10", password: "Salud2026*" },
  ];

  const handleLogin = () => {
    const user = USERS.find(
      (u) =>
        u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    );

    if (!user) {
      Alert.alert("Acceso denegado", "Usuario o contraseña incorrectos.");
      return;
    }

    onLogin(user.username);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, { justifyContent: "center", flex: 1 }]}>
        <View style={styles.docBox}>
          <Text style={styles.title}>Ingreso a la app</Text>
          <Text style={[styles.docText, { marginTop: 8, marginBottom: 16 }]}>
            Esta herramienta es de uso restringido para el equipo autorizado.
          </Text>

          <Text style={styles.docTitle}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Ingrese usuario"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={[styles.docTitle, { marginTop: 12 }]}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Ingrese contraseña"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, { marginTop: 18 }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}