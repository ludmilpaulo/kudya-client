import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';

function DoctorSkeletonCard() {
  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-4 border border-slate-100`}>
      <View style={tw`flex-row`}>
        <View style={tw`w-[72px] h-[72px] rounded-2xl bg-slate-200`} />
        <View style={tw`flex-1 ml-4`}>
          <View style={tw`h-4 bg-slate-200 rounded w-3/4 mb-2`} />
          <View style={tw`h-3 bg-slate-100 rounded w-1/2 mb-3`} />
          <View style={tw`h-6 bg-sky-100 rounded-full w-28 mb-2`} />
          <View style={tw`h-3 bg-slate-100 rounded w-2/3`} />
        </View>
        <View style={tw`h-5 bg-slate-200 rounded w-12`} />
      </View>
    </View>
  );
}

export default function DoctorSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <DoctorSkeletonCard key={i} />
      ))}
    </View>
  );
}
