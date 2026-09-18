import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'; 

// --- 1. DATA GENERATION (40 Students across 8 stages) ---
const STOPS = ['Salem TVS', 'New Bus Stand', 'Kuranguchavadi', 'Mamangam', 'Karuppur', 'Toll Gate', 'Omalur', 'Sikkanampatty'];
const BASE_NAMES = ['Aarav', 'Bhavna', 'Dinesh', 'Harini', 'Kavya', 'Manoj', 'Naveen', 'Pooja', 'Rahul', 'Sneha'];

const generate40Students = () => {
  let list = [];
  let idCounter = 1;
  STOPS.forEach((stop) => {
    for (let i = 0; i < 5; i++) { // 5 students per stop * 8 stops = 40 students
      let name = `${BASE_NAMES[(idCounter - 1) % BASE_NAMES.length]} ${String.fromCharCode(65 + i)}.`;
      list.push({
        id: idCounter.toString(),
        rollNo: `23CS${100 + idCounter}`,
        name: name,
        stop: stop,
        avatar: name.substring(0, 2).toUpperCase(),
        isPresent: false
      });
      idCounter++;
    }
  });
  return list;
};

// --- 2. MAIN APP COMPONENT ---
export default function App() {
  const [selectedRoute, setSelectedRoute] = useState('Route 3: Salem TVS to Sikkanampatty');
  const [students, setStudents] = useState(generate40Students());
  const [isLocked, setIsLocked] = useState(false);

  const tripDetails = {
    staffName: 'Prof. Ramesh K.',
    driverName: 'Mr. Selvam',
  };

  const toggleAttendance = (id) => {
    if (isLocked) {
      Alert.alert('Trip Locked', 'Attendance is already submitted.');
      return;
    }
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, isPresent: !s.isPresent } : s))
    );
  };

  // Group students by their bus stop to display them stage-by-stage
  const groupedStudents = useMemo(() => {
    return STOPS.map(stop => {
      const stopStudents = students.filter(s => s.stop === stop);
      const boarded = stopStudents.filter(s => s.isPresent).length;
      return {
        title: stop,
        data: stopStudents,
        boardedCount: boarded,
        totalCount: stopStudents.length,
        isStageComplete: boarded === stopStudents.length
      };
    });
  }, [students]);

  const presentTotal = students.filter(s => s.isPresent).length;

  const handleSimulateGPS = () => {
    Alert.alert(
      '📍 GPS Geofence Triggered',
      `Bus detected at Hindusthan College Gate (Sikkanampatty).\n\nSummary:\n• Total Boarded: ${presentTotal}/40\n• Absent for the Day: ${40 - presentTotal}\n\nSubmit and lock final attendance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Lock',
          onPress: () => {
            setIsLocked(true);
            Alert.alert('✅ Success', 'Attendance data submitted to College Management Portal. Absentees marked for the day.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appTitle}>HCTBusTrack</Text>
            <Text style={styles.subTitle}>Stage-by-Stage Attendance</Text>
          </View>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bus-school" size={28} color="#38bdf8" />
          </View>
        </View>
        
        <View style={styles.routeBadge}>
          <Feather name="map-pin" size={14} color="#38bdf8" style={{marginRight: 6}} />
          <Text style={styles.routeText}>{selectedRoute}</Text>
        </View>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>40</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#00e676' }]}>{presentTotal}</Text>
          <Text style={styles.statLabel}>Boarded</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#ff4a4a' }]}>{40 - presentTotal}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      {/* STAGE-BY-STAGE SECTION LIST */}
      <SectionList
        sections={groupedStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        
        // Renders the header for EACH bus stop with live boarding counts
        renderSectionHeader={({ section }) => (
          <View style={styles.stageHeader}>
            <View style={styles.stageHeaderLeft}>
              <MaterialCommunityIcons name="bus-stop" size={22} color="#38bdf8" />
              <Text style={styles.stageTitle}>{section.title}</Text>
            </View>
            <View style={[styles.stageCountBadge, section.isStageComplete && styles.stageCompleteBadge]}>
              <Text style={[styles.stageCountText, section.isStageComplete && styles.stageCompleteText]}>
                {section.boardedCount} / {section.totalCount} Boarded
              </Text>
            </View>
          </View>
        )}

        // Renders individual students inside that specific stage
        renderItem={({ item }) => (
          <View style={[styles.card, item.isPresent && styles.cardActive]}>
            <View style={[styles.avatar, item.isPresent ? styles.avatarPresent : styles.avatarAbsent]}>
              <Text style={styles.avatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentMeta}>{item.rollNo}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.badge, item.isPresent ? styles.presentBadge : styles.absentBadge]}
              onPress={() => toggleAttendance(item.id)}
            >
              <MaterialCommunityIcons 
                name={item.isPresent ? "check-bold" : "close-thick"} 
                size={16} 
                color="#ffffff" 
              />
              <Text style={styles.badgeText}>
                {item.isPresent ? 'Present' : 'Absent'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Footer / Auto-Lock Feature */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.gpsButton, isLocked ? styles.lockedButton : styles.activeButton]}
          onPress={handleSimulateGPS}
          disabled={isLocked}
        >
          <MaterialCommunityIcons 
            name={isLocked ? "lock-check" : "crosshairs-gps"} 
            size={24} 
            color="#ffffff" 
            style={{marginRight: 10}}
          />
          <Text style={styles.gpsButtonText}>
            {isLocked ? 'ATTENDANCE SECURED & LOGGED' : 'REACHED COLLEGE: LOCK ABSENTEES'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- 3. STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' }, 
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#0B0F19' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: 1 },
  subTitle: { fontSize: 13, color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 2 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(56, 189, 248, 0.1)', justifyContent: 'center', alignItems: 'center' },
  routeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginTop: 16 },
  routeText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 13 },
  
  statsCard: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#131C2D',
    marginHorizontal: 20, marginBottom: 16, padding: 18, borderRadius: 20,
    borderWidth: 1, borderColor: '#1e293b'
  },
  statBox: { alignItems: 'center', flex: 1 },
  divider: { width: 1, backgroundColor: '#1e293b', marginVertical: 5 },
  statNumber: { fontSize: 26, fontWeight: '900', color: '#f8fafc' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  
  stageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f172a', paddingVertical: 12, paddingHorizontal: 20,
    marginTop: 10, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#1e293b'
  },
  stageHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  stageTitle: { fontSize: 16, fontWeight: '800', color: '#e2e8f0', marginLeft: 8 },
  stageCountBadge: { backgroundColor: '#1e293b', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  stageCompleteBadge: { backgroundColor: 'rgba(0, 230, 118, 0.2)' },
  stageCountText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  stageCompleteText: { color: '#00e676' },

  card: {
    flexDirection: 'row', backgroundColor: '#131C2D', marginHorizontal: 20, marginVertical: 6,
    padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b'
  },
  cardActive: { borderColor: 'rgba(0, 230, 118, 0.3)', backgroundColor: '#152427' },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarAbsent: { backgroundColor: '#1e293b' },
  avatarPresent: { backgroundColor: 'rgba(0, 230, 118, 0.2)' },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
  studentMeta: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  badge: { 
    flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, 
    borderRadius: 8, justifyContent: 'center', alignItems: 'center', width: 90 
  },
  presentBadge: { backgroundColor: '#16a34a' },
  absentBadge: { backgroundColor: '#475569' },
  badgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  
  footer: { padding: 20, backgroundColor: '#0B0F19' },
  gpsButton: {
    flexDirection: 'row', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  activeButton: { backgroundColor: '#38bdf8' },
  lockedButton: { backgroundColor: '#1e293b' },
  gpsButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
