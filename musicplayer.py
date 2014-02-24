#-------------------------------------------------------------------------------
# Name:        Droy music
# Purpose: Droy music
#
# Author:      RIshabh ROy
#
# Created:     21/02/2014
# Copyright:   (c) Droy - rishabh roy @    rishabhbhsixfeet@gmail.com
# Licence:     <My irc nick name is droy >
#-------------------------------------------------------------------------------

def main():
    pass

if __name__ == '__main__':
    main()
from Tkinter import *
import mp3play
import tkFileDialog
import Tkinter
import tkFont
import Tkinter as tk

class musicplay:
    def __init__(self):
        self.music = None
        self.play_list = []
        self.trackLocations = []

        self.root = tk.Tk()
        self.root.title("DroyMusicPlayer")

        self.root.configure(background='black')
        self.root.geometry('300x100+750+300')

        self.filename = Tkinter.StringVar()
        self.name = Tkinter.StringVar()
        self.play_list = Tkinter.StringVar()

        menubar = Menu(self.root)
        filemenu = Menu(menubar, tearoff=0, bg="black", fg="Orange")
        menubar.add_cascade(label='File', menu = filemenu)
        filemenu.add_command(label='Open', command = self.open_file)
        filemenu.add_separator()
        filemenu.add_command(label='Exit', command = self.Exit)
        self.root.config(menu=menubar)

        open_file = Button(self.root, width = 6, height = 1,
                           text = 'Mood',fg='Orange', bg='black')
        open_file.grid(row=0, column=3)

        play_button = Button(self.root, width = 5, height = 1, text='Play',
                             fg='Orange', command = self.play, bg="black")
        play_button.grid(row=0, column=0, sticky = W)

        stop_button = Button(self.root, width = 5, height = 1, text='Stop',
                             fg='Orange', command = self.stop, bg="black")
        stop_button.grid(row=0, column=1, sticky = W)

        pause_button = Button(self.root, width = 5, height = 1, text='Pause',
                              fg='Orange', command = self.pause, bg="black")
        pause_button.grid(row=0, column=2)

        self.volume_slider = Scale(self.root, label='Volume',
                              orient = 'horizontal', fg = 'Orange',
                              command = self.vol, bg="black")
        self.volume_slider.grid(row=0, column=4)

        file_name_label = Label(self.root, font=('Comic Sans', 8),
                                fg = 'Orange', wraplength = 300,
                                textvariable=self.name, bg="black")
        file_name_label.grid(row=3, column=0, columnspan=8)

        play_list_window = Toplevel(self.root, height = 150, width = 100)
        play_list_window.title("Playlist")
        self.play_list_display = Listbox(play_list_window, selectmode=EXTENDED,
                                    width = 50, bg="Dark Slate grey",
                                    fg="Orange")
        self.play_list_display.bind("<Double-Button-1>", self.tune_changed)
        self.play_list_display.pack()
        play_list_window.mainloop()

        self.root.mainloop()

    def open_file(self):
        """
        Opens a dialog box to open .mp3 filemusic,
        then sends filename to file_name_label.
        """
        self.filename.set(tkFileDialog.askopenfilename(
            defaultextension = ".mp3",
            filetypes=[("All Types", ".*"), ("MP3", ".mp3")]))
        self.playlist = self.filename.get()
        playlist_pieces = self.playlist.split("/")
        self.play_list.set (playlist_pieces[-1])
        playl = self.play_list.get()
        self.play_list_display.insert(END, playl)
        print self.filename.get()
        self.music = mp3play.load(self.filename.get())
        pieces = self.filename.get().split("/")
        self.trackLocations += [self.filename.get()]
        self.name.set(pieces[-1])

    def play(self):
        """Plays the .mp3 file"""
        self.music.play()

    def stop(self):
        """Stops the .mp3 file"""
        self.music.stop()

    def pause(self):
        """Pauses or unpauses the .mp3 file"""
        if self.music.ispaused():
            self.music.unpause()
        else:
            self.music.pause()

    def vol(self, event):
        """Allows volume to be changed with the slider"""
        v = Scale.get(self.volume_slider)
        try:
            self.music.volume(v)
        except:
            pass

    def tune_changed(self, event):
        idx = event.widget.curselection()[0]
        self.music = mp3play.load(self.trackLocations[int(idx)])
        print ("Now playing %s" % event.widget.get(idx))

    def Exit(self):
        exit()

if __name__ == "__main__":
    musicplay()