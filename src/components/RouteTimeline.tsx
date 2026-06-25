import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface RouteTimelineProps {
  origin: string;
  originSubtext?: string;
  destination: string;
  destinationSubtext?: string;
}

export default function RouteTimeline({ 
  origin, 
  originSubtext, 
  destination, 
  destinationSubtext 
}: RouteTimelineProps) {
  return (
    <View style={styles.container}>
      {/* Left side: Dots and Line */}
      <View style={styles.timelineGraphic}>
        <View style={styles.originDot} />
        <View style={styles.connectingLine} />
        <View style={styles.destinationDot} />
      </View>

      {/* Right side: Text details */}
      <View style={styles.detailsContainer}>
        <View style={styles.pointContainer}>
          <Text style={styles.pointTitle}>{origin}</Text>
          {originSubtext && <Text style={styles.pointSubtext}>{originSubtext}</Text>}
        </View>
        
        <View style={styles.pointContainer}>
          <Text style={styles.pointTitle}>{destination}</Text>
          {destinationSubtext && <Text style={styles.pointSubtext}>{destinationSubtext}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineGraphic: {
    alignItems: 'center',
    width: 24,
    paddingVertical: 6, // Align dots with the text
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.background,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
    borderRadius: 1,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: SPACING.sm,
    gap: SPACING.xl, // Spacing between origin and destination
  },
  pointContainer: {
    justifyContent: 'center',
  },
  pointTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  pointSubtext: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
