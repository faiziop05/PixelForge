import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '../components/common/CustomAlert';
import { useTheme } from './ThemeContext';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const { theme } = useTheme();
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false,
        onConfirm: null,
        onClose: null,
    });

    const showAlert = useCallback(({
        title,
        message,
        type = 'info',
        confirmText = 'OK',
        cancelText = 'Cancel',
        showCancel = false,
        onConfirm,
        onClose,
    }) => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            showCancel,
            onConfirm,
            onClose,
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertState(prev => ({ ...prev, visible: false }));
        if (alertState.onClose) {
            alertState.onClose();
        }
    }, [alertState]);

    const handleConfirm = useCallback(() => {
        setAlertState(prev => ({ ...prev, visible: false }));
        if (alertState.onConfirm) {
            alertState.onConfirm();
        }
    }, [alertState]);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={alertState.visible}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                theme={theme}
                confirmText={alertState.confirmText}
                cancelText={alertState.cancelText}
                showCancel={alertState.showCancel}
                onClose={hideAlert}
                onConfirm={handleConfirm}
            />
        </AlertContext.Provider>
    );
};
