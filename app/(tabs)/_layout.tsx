import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { theme } from "../../src/themes";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: "700",
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "events") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "applications") {
            iconName = focused ? "document-text" : "document-text-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Dashboard",
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          headerTitle: "Events",
          tabBarLabel: "Events",
        }}
      />

      <Tabs.Screen
        name="applications"
        options={{
          title: "My Applications",
          headerTitle: "My Applications",
          tabBarLabel: "Applications",
        }}
      />
    </Tabs>
  );
}
