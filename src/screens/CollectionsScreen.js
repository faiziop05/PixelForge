import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import EmptyState from '../components/common/EmptyState';

export default function CollectionsScreen({ navigation }) {
    const { theme } = useTheme();
    const [collections, setCollections] = useState([]);
    const [showNewCollection, setShowNewCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) {
            Alert.alert('Error', 'Please enter a collection name');
            return;
        }

        const newCollection = {
            id: Date.now().toString(),
            name: newCollectionName,
            items: [],
            createdAt: new Date().toISOString(),
        };

        setCollections(prev => [...prev, newCollection]);
        setNewCollectionName('');
        setShowNewCollection(false);
    };

    const handleDeleteCollection = (collectionId) => {
        Alert.alert(
            'Delete Collection',
            'Are you sure you want to delete this collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setCollections(prev => prev.filter(c => c.id !== collectionId));
                    },
                },
            ]
        );
    };

    const CollectionCard = ({ collection }) => (
        <TouchableOpacity
            style={[styles.collectionCard, { backgroundColor: theme.surface }]}
            activeOpacity={0.7}
            onLongPress={() => handleDeleteCollection(collection.id)}
        >
            <View style={[styles.collectionIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="folder" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.collectionName, { color: theme.text }]}>
                {collection.name}
            </Text>
            <Text style={[styles.collectionCount, { color: theme.textSecondary }]}>
                {collection.items.length} items
            </Text>
        </TouchableOpacity>
    );

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {showNewCollection && (
                <View style={[styles.newCollectionContainer, { backgroundColor: theme.surface }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        placeholder="Collection name..."
                        placeholderTextColor={theme.textSecondary}
                        value={newCollectionName}
                        onChangeText={setNewCollectionName}
                        autoFocus
                    />
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreateCollection}
                    >
                        <Text style={styles.createButtonText}>Create</Text>
                    </TouchableOpacity>
                </View>
            )}

            {collections.length === 0 && !showNewCollection ? (
                <EmptyState
                    icon="folder-open-outline"
                    title="No Collections"
                    message="Create collections to organize your wallpapers"
                />
            ) : (
                <ScrollView contentContainerStyle={styles.list}>
                    {collections.map(collection => (
                        <CollectionCard key={collection.id} collection={collection} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newCollectionContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    createButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    collectionCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    collectionIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    collectionName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    collectionCount: {
        fontSize: 14,
    },
});
